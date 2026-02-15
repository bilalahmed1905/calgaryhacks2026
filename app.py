import gradio as gr
from image_gen import generate_image
from video_gen import generate_video
from utils import build_module1_prompt, build_module2_prompt, build_module3_prompt


def on_generate_module1(field, template_idx):
    """Generate an image for Module 1: Skills Discovery."""
    prompt = build_module1_prompt(field, int(template_idx))
    image, path = generate_image(prompt)
    return image, prompt, f"Saved to: {path}"


def on_generate_module2(field, concept, template_idx):
    """Generate an image for Module 2: VUCA & Uncertainty."""
    prompt = build_module2_prompt(field, concept, int(template_idx))
    image, path = generate_image(prompt)
    return image, prompt, f"Saved to: {path}"


def on_generate_module3(field, template_idx):
    """Generate an image for Module 3: Practical AI Skills."""
    prompt = build_module3_prompt(field, int(template_idx))
    image, path = generate_image(prompt)
    return image, prompt, f"Saved to: {path}"


def on_generate_image(prompt):
    """Generate a custom image."""
    image, path = generate_image(prompt=prompt)
    return image, f"Saved to: {path}"


def on_generate_video(prompt):
    """Generate a video."""
    path = generate_video(prompt)
    return path, f"Saved to: {path}"


def build_app():
    """Gradio interface for ClarityPath image generation."""
    with gr.Blocks(title="ClarityPath — Image Generator") as app:
        gr.Markdown("# ClarityPath — Image Generator")

        with gr.Tab("Module 1: Skills Discovery"):
            with gr.Row():
                with gr.Column():
                    m1_field = gr.Textbox(label="Career Field", placeholder="e.g. software engineering, healthcare")
                    m1_template = gr.Slider(0, 2, value=0, step=1, label="Template Style")
                    m1_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    m1_image = gr.Image(label="Generated Image")
                    m1_prompt = gr.Textbox(label="Prompt Used", interactive=False)
                    m1_status = gr.Textbox(label="Status", interactive=False)

            m1_btn.click(
                on_generate_module1,
                inputs=[m1_field, m1_template],
                outputs=[m1_image, m1_prompt, m1_status],
            )

        with gr.Tab("Module 2: VUCA & Uncertainty"):
            with gr.Row():
                with gr.Column():
                    m2_field = gr.Textbox(label="Career Field", placeholder="e.g. software engineering, healthcare")
                    m2_concept = gr.Dropdown(
                        choices=["volatility", "uncertainty", "complexity", "ambiguity"],
                        label="VUCA Concept",
                        value="uncertainty",
                    )
                    m2_template = gr.Slider(0, 2, value=0, step=1, label="Template Style")
                    m2_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    m2_image = gr.Image(label="Generated Image")
                    m2_prompt = gr.Textbox(label="Prompt Used", interactive=False)
                    m2_status = gr.Textbox(label="Status", interactive=False)

            m2_btn.click(
                on_generate_module2,
                inputs=[m2_field, m2_concept, m2_template],
                outputs=[m2_image, m2_prompt, m2_status],
            )

        with gr.Tab("Module 3: Practical AI Skills"):
            with gr.Row():
                with gr.Column():
                    m3_field = gr.Textbox(label="Career Field", placeholder="e.g. software engineering, healthcare")
                    m3_template = gr.Slider(0, 2, value=0, step=1, label="Template Style")
                    m3_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    m3_image = gr.Image(label="Generated Image")
                    m3_prompt = gr.Textbox(label="Prompt Used", interactive=False)
                    m3_status = gr.Textbox(label="Status", interactive=False)

            m3_btn.click(
                on_generate_module3,
                inputs=[m3_field, m3_template],
                outputs=[m3_image, m3_prompt, m3_status],
            )

        with gr.Tab("Custom Image"):
            with gr.Row():
                with gr.Column():
                    custom_prompt = gr.Textbox(label="Prompt", placeholder="Describe the image...")
                    custom_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    custom_image = gr.Image(label="Generated Image")
                    custom_status = gr.Textbox(label="Status", interactive=False)

            custom_btn.click(
                on_generate_image,
                inputs=[custom_prompt],
                outputs=[custom_image, custom_status],
            )

        with gr.Tab("Video"):
            with gr.Row():
                with gr.Column():
                    video_prompt = gr.Textbox(label="Prompt", placeholder="Describe the video...")
                    video_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    video_output = gr.Video(label="Generated Video")
                    video_status = gr.Textbox(label="Status", interactive=False)

            video_btn.click(
                on_generate_video,
                inputs=[video_prompt],
                outputs=[video_output, video_status],
            )

    return app


if __name__ == "__main__":
    app = build_app()
    app.launch(share=False)
