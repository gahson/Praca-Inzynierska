import tkinter as tk
from tkinter import simpledialog, messagebox
from PIL import Image, ImageTk
import torch
from diffusers import StableDiffusionGLIGENPipeline
from diffusers.utils import load_image
import io
import requests

class BoxPromptApp:
    def __init__(self, master):
        self.master = master
        self.master.title("GLIGEN Box & Prompt UI")

        # Load image from URL
        self.pil_image = Image.open('house_interior.png')
        self.img_width, self.img_height = self.pil_image.size

        self.tk_image = ImageTk.PhotoImage(self.pil_image)

        self.margin = 50
        canvas_width = self.img_width + self.margin * 2
        canvas_height = self.img_height + self.margin * 2

        self.canvas = tk.Canvas(master, width=canvas_width, height=canvas_height, bg="white")
        self.canvas.pack()

        # Place image with margin offset
        self.canvas.create_image(self.margin, self.margin, anchor="nw", image=self.tk_image)

        self.boxes = []  # normalized boxes [x1, y1, x2, y2]
        self.prompts = []  # prompt per box

        self.start_x = None
        self.start_y = None
        self.rect = None

        self.canvas.bind("<ButtonPress-1>", self.on_button_press)
        self.canvas.bind("<B1-Motion>", self.on_move_press)
        self.canvas.bind("<ButtonRelease-1>", self.on_button_release)

        btn_frame = tk.Frame(master)
        btn_frame.pack(fill="x")

        self.generate_btn = tk.Button(btn_frame, text="Generate Image", command=self.generate_image)
        self.generate_btn.pack(side="left")

        self.clear_btn = tk.Button(btn_frame, text="Clear Boxes", command=self.clear_boxes)
        self.clear_btn.pack(side="left")

        self.rectangles_on_canvas = []  # store canvas rectangles

        # Load GLIGEN pipeline (will take some time)
        self.pipe = StableDiffusionGLIGENPipeline.from_pretrained(
            "masterful/gligen-1-4-inpainting-text-box", variant="fp16", torch_dtype=torch.float16
        )
        self.pipe = self.pipe.to("cuda")

    def on_button_press(self, event):
        self.start_x = event.x - self.margin
        self.start_y = event.y - self.margin
        if self.rect:
            self.canvas.delete(self.rect)
        self.rect = self.canvas.create_rectangle(
            event.x, event.y, event.x, event.y, outline='red'
        )

    def on_move_press(self, event):
        curX = event.x
        curY = event.y
        self.canvas.coords(self.rect, self.start_x + self.margin, self.start_y + self.margin, curX, curY)

    def on_button_release(self, event):
        end_x = event.x - self.margin
        end_y = event.y - self.margin

        x1 = min(self.start_x, end_x)
        y1 = min(self.start_y, end_y)
        x2 = max(self.start_x, end_x)
        y2 = max(self.start_y, end_y)

        # Check box size > 1% image size
        if abs(x2 - x1) < self.img_width * 0.01 or abs(y2 - y1) < self.img_height * 0.01:
            self.canvas.delete(self.rect)
            self.rect = None
            return

        # Ask for prompt
        prompt = simpledialog.askstring("Input", "Enter prompt for this box:", parent=self.master)
        if prompt is None or prompt.strip() == "":
            self.canvas.delete(self.rect)
            self.rect = None
            return

        # Normalize coords 0-1
        norm_box = [x1 / self.img_width, y1 / self.img_height, x2 / self.img_width, y2 / self.img_height]
        self.boxes.append(norm_box)
        self.prompts.append(prompt)

        self.rectangles_on_canvas.append(self.rect)
        self.rect = None

    def clear_boxes(self):
        for r in self.rectangles_on_canvas:
            self.canvas.delete(r)
        self.boxes = []
        self.prompts = []
        self.rectangles_on_canvas = []

    def generate_image(self):
        if not self.boxes or not self.prompts:
            messagebox.showwarning("Warning", "Draw at least one box and enter prompt!")
            return

        # Run GLIGEN pipeline
        output_images = self.pipe(
            prompt=", ".join(self.prompts),
            gligen_phrases=self.prompts,
            gligen_inpaint_image=self.pil_image,
            gligen_boxes=self.boxes,
            gligen_scheduled_sampling_beta=1,
            output_type="pil",
            num_inference_steps=50,
        ).images

        out_img = output_images[0]
        out_img_tk = ImageTk.PhotoImage(out_img)

        top = tk.Toplevel(self.master)
        top.title("Generated Image")
        label = tk.Label(top, image=out_img_tk)
        label.image = out_img_tk
        label.pack()

        out_img.save("gligen_output.jpg")


if __name__ == "__main__":
    root = tk.Tk()
    app = BoxPromptApp(root)
    root.mainloop()
