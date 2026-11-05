import os
import json
import base64

def extract_notebook_graphs(notebook_path, output_dir):
    """
    Extracts all embedded graphs/images from a Jupyter Notebook
    and saves them as PNG/JPEG files in output_dir.
    """
    os.makedirs(output_dir, exist_ok=True)

    with open(notebook_path, "r", encoding="utf-8") as f:
        nb = json.load(f)

    graph_names = {
        35: "actual_vs_predicted_cutoff",
        43: "actual_vs_predicted_best_model",
        44: "random_forest_actual_vs_predicted"
    }

    count = 0
    for idx, cell in enumerate(nb.get("cells", [])):
        outputs = cell.get("outputs", [])
        for out in outputs:
            data = out.get("data", {})
            for mime, val in data.items():
                if mime.startswith("image/"):
                    ext = mime.split("/")[-1].replace("+xml", "")
                    if ext == "jpeg":
                        ext = "jpg"

                    desc = graph_names.get(idx, f"cell_{idx}")
                    filename = f"graph_{count+1:02d}_cell_{idx}_{desc}.{ext}"
                    filepath = os.path.join(output_dir, filename)

                    img_data = "".join(val) if isinstance(val, list) else val
                    with open(filepath, "wb") as img_file:
                        img_file.write(base64.b64decode(img_data))

                    print(f"Saved: {filename} ({os.path.getsize(filepath):,} bytes)")
                    count += 1

    print(f"\nDone! Successfully extracted {count} graphs to '{output_dir}'.")

if __name__ == "__main__":
    nb_path = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\ML_Algorithm.ipynb"
    out_dir = r"D:\M_Tech_Data_Science\ML\College_Cut_Of_Predection\extracted_graphs"
    extract_notebook_graphs(nb_path, out_dir)
