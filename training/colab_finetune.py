# ============================================
# Fine-Tune Llama 3.2 3B for Educational Content
# Run this in Google Colab (free T4 GPU)
# ============================================
# 
# INSTRUCTIONS:
# 1. Go to https://colab.research.google.com
# 2. Click "New Notebook"
# 3. Runtime → Change runtime type → T4 GPU → Save
# 4. Copy ALL of this into one cell and run it
# 5. When it asks for HuggingFace token, paste yours
# 6. Training takes ~25-35 minutes
# 7. At the end it downloads the model files for you
# ============================================

# --- CELL 1: Install everything ---

# --- CELL 2: Import and load model ---
from unsloth import FastLanguageModel
import torch

max_seq_length = 4096
dtype = None  # auto-detect
load_in_4bit = True  # use QLoRA

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Llama-3.2-3B-Instruct",
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)

print("✅ Model loaded!")

# --- CELL 3: Add LoRA adapters ---
model = FastLanguageModel.get_peft_model(
    model,
    r=16,                    # LoRA rank
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                     "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

print("✅ LoRA adapters added!")

# --- CELL 4: Upload your training data ---
# Upload training_data.jsonl to Colab:
# Click the folder icon on the left → Upload → select training_data.jsonl
import json
from datasets import Dataset

# Load the JSONL file
data = []
with open("training_data.jsonl", "r") as f:
    for line in f:
        data.append(json.loads(line.strip()))

print(f"✅ Loaded {len(data)} training examples")

# Format into the chat template the model expects
def format_example(example):
    messages = example["messages"]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
    return {"text": text}

dataset = Dataset.from_list(data)
dataset = dataset.map(format_example)
print(f"✅ Dataset formatted! Sample:\n{dataset[0]['text'][:200]}...")

# --- CELL 5: Train! ---
from trl import SFTTrainer
from transformers import TrainingArguments
from unsloth import is_bfloat16_supported

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    dataset_num_proc=2,
    packing=False,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        num_train_epochs=3,        # 3 passes over the data
        learning_rate=2e-4,
        fp16=not is_bfloat16_supported(),
        bf16=is_bfloat16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir="outputs",
        report_to="none",
    ),
)

print("🚀 Starting training...")
trainer_stats = trainer.train()
print(f"✅ Training complete! Time: {trainer_stats.metrics['train_runtime']:.0f}s")

# --- CELL 6: Test the model ---
FastLanguageModel.for_inference(model)

messages = [
    {"role": "system", "content": "You are an AI education tutor that generates personalized learning content. Return JSON."},
    {"role": "user", "content": "Generate a welcome message for Bilal. He is a 3rd year Computer Science student interested in AI/ML. Profile: The Curious Explorer. Biggest fear: ai_relevance. Tone: challenging."},
]

inputs = tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
outputs = model.generate(input_ids=inputs, max_new_tokens=300, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print("🧪 Test output:")
print(response)

# --- CELL 7: Save model in GGUF format (for Ollama) ---
print("💾 Saving model as GGUF (this takes a few minutes)...")
model.save_pretrained_gguf("model_gguf", tokenizer, quantization_method="q4_k_m")
print("✅ GGUF model saved!")

# --- CELL 8: Download the model file ---
from google.colab import files
import os

# Find the GGUF file
for f in os.listdir("model_gguf"):
    if f.endswith(".gguf"):
        print(f"📥 Downloading {f}...")
        files.download(f"model_gguf/{f}")
        break

print("""
============================================
✅ DONE! Next steps:
============================================
1. The GGUF file is downloading to your computer
2. Install Ollama on your Mac: https://ollama.ai
3. Create a Modelfile (instructions below)
4. Run: ollama create edu-model -f Modelfile
5. Your model is ready to use locally!

Your Modelfile should contain:
---
FROM ./your-downloaded-file.gguf
SYSTEM "You are an AI education tutor that generates personalized learning content. Return JSON."
PARAMETER temperature 0.7
PARAMETER top_p 0.9
---
""")
