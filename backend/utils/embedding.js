import { TextEmbedder, FilesetResolver } from "@mediapipe/tasks-text";

let textEmbedderInstance = null;

export async function getEmbedder() {
    if (textEmbedderInstance) return textEmbedderInstance;

    try {
        const textFiles = await FilesetResolver.forTextTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text@latest/wasm/"
        );
        textEmbedderInstance = await TextEmbedder.createFromOptions(textFiles, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/text_embedder/universal_sentence_encoder/float32/1/universal_sentence_encoder.tflite"
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
