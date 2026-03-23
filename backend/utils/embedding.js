import { TextEmbedder, FilesetResolver } from "@mediapipe/tasks-text";

let textEmbedderInstance = null;

export async function getEmbedder() {
    if (textEmbedderInstance) return textEmbedderInstance;

    try {
        const textFiles = await FilesetResolver.forTextTasks(
            process.env.WASM_PATH
        );
        textEmbedderInstance = await TextEmbedder.createFromOptions(textFiles, {
            baseOptions: {
                modelAssetPath: process.env.MODEL_PATH
            }
        });
        return textEmbedderInstance;
    } catch (error) {
        console.error("Failed to initialize TextEmbedder:", error);
        throw error;
    }
}

export async function generateEmbedding(text) {
    const embedder = await getEmbedder();
    const result = embedder.embed(text);
    return Array.from(result.embeddings[0].floatEmbedding);
}
