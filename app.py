import gradio as gr
from image_gen import generate_image
from video_gen import generate_video
from utils import build_skills_prompt, build_vuca_prompt


def on_generate_image(prompt):
    """Handle image generation from the Gradio UI."""
    image, path = generate_image(prompt=prompt)
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
    path = generate_video(prompt)
    return path, f"Saved to: {path}"


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
                    custom_btn = gr.Button("Generate", variant="primary")
                with gr.Column():
                    custom_image = gr.Image(label="Generated Image")
                    custom_status = gr.Textbox(label="Status", interactive=False)

            custom_btn.click(
                on_generate_image,
                inputs=[custom_prompt],
                outputs=[custom_image, custom_status],
            )

        with gr.Tab("Video Generation"):
            with gr.Row():
                with gr.Column():
                    video_prompt = gr.Textbox(label="Prompt", placeholder="Describe the video you want to generate...")
                    video_btn = gr.Button("Generate Video", variant="primary")
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
