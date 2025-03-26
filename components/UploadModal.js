
import { useEffect, useState } from "react";
import Modal from "react-modal";

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const MAX_SIZE_MB = 50;

  useEffect(() => {
    if (isOpen) {
      // Réinitialiser le formulaire à chaque ouverture
      setFile(null);
      setPreview(null);
      setTitle("");
      setTags("");
      setMessage("");
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected && selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage(`❌ Fichier trop volumineux (max ${MAX_SIZE_MB}MB)`);
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !tags.trim()) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("tags", tags);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Upload réussi !");
        if (onSuccess) onSuccess(data.file);
        onClose();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {}}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      className="modal-content upload-modal-content"
      overlayClassName="overlay"
    >
      <button className="close-button" onClick={onClose}>✖</button>
      <h2 style={{ color: "#00eaff", marginBottom: "15px" }}>Uploader un fichier</h2>

      <textarea
  placeholder="Titre ou description"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="upload-textarea"
/>


<textarea
  placeholder="Tags (ex: art, IA)"
  value={tags}
  onChange={(e) => setTags(e.target.value)}
  className="upload-textarea"
/>

      <input type="file" onChange={handleFileChange} className="upload-input" />

      {preview && (
        <div className="upload-preview">
          {file?.type.startsWith("video") ? (
            <video src={preview} controls />
          ) : (
            <img src={preview} alt="Aperçu" />
          )}
        </div>
      )}

      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Envoi en cours..." : "📤 Uploader"}
      </button>

      {message && (
        <p style={{ textAlign: "center", marginTop: "10px", color: message.startsWith("✅") ? "lightgreen" : "tomato" }}>
          {message}
        </p>
      )}
    </Modal>
  );
}
