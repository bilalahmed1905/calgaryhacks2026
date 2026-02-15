import gradio as gr
from image_gen import generate_image
from video_gen import generate_video
from finetune import finetune_lora
from utils import build_skills_prompt, build_vuca_prompt


def on_generate_image(prompt, steps, guidance, width, height):
    """Handle image generation from the Gradio UI."""
    image, path = generate_image(
        prompt=prompt,
        num_inference_steps=int(steps),
        guidance_scale=float(guidance),
        width=int(width),
        height=int(height),
    )
    return image, f"Saved to: {path}"


def on_generate_skills_image(field, template_idx):
    """Generate an image for the Skills Assessment module."""
    prompt = build_skills_prompt(field, int(template_idx))
    image, path = generate_image(prompt)
    return image, prompt, f"Saved to: {path}"


def on_generate_vuca_image(concept, template_idx):
    """Generate an image for the VUCA module."""
    prompt = build_vuca_prompt(concept, int(template_idx))
    image, path = generate_image(prompt)
    return image, prompt, f"Saved to: {path}"


def on_generate_video(prompt):
    """Handle video generation from the Gradio UI."""
    path = generate_video(prompt, use_api=True)
    return path, f"Saved to: {path}"


def on_finetune(image_folder, prompt, epochs, lr, rank):
    """Handle LoRA fine-tuning from the Gradio UI."""
    save_path = finetune_lora(
        image_folder=image_folder,
        prompt=prompt,
        num_epochs=int(epochs),
        learning_rate=float(lr),
        lora_rank=int(rank),
    )
    return f"Training complete! LoRA weights saved to: {save_path}"


def build_app():
    """Build the Gradio interface for Ascend Ignite content generation."""
    with gr.Blocks(title="Ascend Ignite — AI Content Generator") as app:
        gr.Markdown("# Ascend Ignite — AI Content Generator")
        gr.Markdown("Generate educational images and videos for the Skills Assessment and VUCA modules.")

        with gr.Tab("Skills Assessment"):
            with gr.Row():
                with gr.Column():
                    field_input = gr.Textbox(label="Career Field", placeholder="e.g. software engineering, healthcare, finance")
                    template_select = gr.Slider(0, 2, value=0, step=1, label="Template Style")
                    skills_btn = gr.Button("Generate Image", variant="primary")
                with gr.Column():
                    skills_image = gr.Image(label="Generated Image")
                    skills_prompt = gr.Textbox(label="Prompt Used", interactive=False)
                    skills_status = gr.Textbox(label="Status", interactive=False)

            skills_btn.click(
                on_generate_skills_image,
                inputs=[field_input, template_select],
                outputs=[skills_image, skills_prompt, skills_status],
            )

        with gr.Tab("VUCA"):
            with gr.Row():
                with gr.Column():
                    vuca_concept = gr.Dropdown(
                        choices=["volatility", "uncertainty", "complexity", "ambiguity"],
                        label="VUCA Concept",
                        value="uncertainty",
                    )
                    vuca_template = gr.Slider(0, 2, value=0, step=1, label="Template Style")
                    vuca_btn = gr.Button("Generate Image", variant="primary")
                with gr.Column():
                    vuca_image = gr.Image(label="Generated Image")
                    vuca_prompt = gr.Textbox(label="Prompt Used", interactive=False)
                    vuca_status = gr.Textbox(label="Status", interactive=False)

            vuca_btn.click(
                on_generate_vuca_image,
                inputs=[vuca_concept, vuca_template],
                outputs=[vuca_image, vuca_prompt, vuca_status],
            )

        with gr.Tab("Custom Image"):
            with gr.Row():
                with gr.Column():
                    custom_prompt = gr.Textbox(label="Prompt", placeholder="Describe the image you want to generate...")
                    custom_steps = gr.Slider(10, 50, value=30, step=5, label="Inference Steps")
                    custom_guidance = gr.Slider(1.0, 15.0, value=7.5, step=0.5, label="Guidance Scale")
                    custom_width = gr.Slider(256, 768, value=512, step=64, label="Width")
                    custom_height = gr.Slider(256, 768, value=512, step=64, label="Height")
                    custom_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    custom_image = gr.Image(label="Generated Image")
                    custom_status = gr.Textbox(label="Status", interactive=False)

            custom_btn.click(
                on_generate_image,
                inputs=[custom_prompt, custom_steps, custom_guidance, custom_width, custom_height],
                outputs=[custom_image, custom_status],
            )

        with gr.Tab("Video Generation"):
            with gr.Row():
                with gr.Column():
                    video_prompt = gr.Textbox(label="Prompt", placeholder="Describe the video you want to generate...")
                    video_btn = gr.Button("Generate Video (API)", variant="primary")
                with gr.Column():
                    video_output = gr.Video(label="Generated Video")
                    video_status = gr.Textbox(label="Status", interactive=False)

            video_btn.click(
                on_generate_video,
                inputs=[video_prompt],
                outputs=[video_output, video_status],
            )

        with gr.Tab("Fine-Tune (LoRA)"):
            gr.Markdown("Fine-tune the image model on your own dataset using LoRA.")
            with gr.Row():
                with gr.Column():
                    ft_folder = gr.Textbox(label="Image Folder Path", placeholder="/path/to/training/images")
                    ft_prompt = gr.Textbox(label="Training Prompt", placeholder="educational career illustration, professional")
                    ft_epochs = gr.Slider(1, 20, value=5, step=1, label="Epochs")
                    ft_lr = gr.Number(value=1e-4, label="Learning Rate")
                    ft_rank = gr.Slider(2, 16, value=4, step=2, label="LoRA Rank")
                    ft_btn = gr.Button("Start Fine-Tuning", variant="primary")
                with gr.Column():
                    ft_status = gr.Textbox(label="Status", interactive=False, lines=5)

            ft_btn.click(
                on_finetune,
                inputs=[ft_folder, ft_prompt, ft_epochs, ft_lr, ft_rank],
                outputs=[ft_status],
            )

    return app


if __name__ == "__main__":
    app = build_app()
    app.launch(share=False)
