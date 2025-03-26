import { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faVideo, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import UploadModal from "@/components/UploadModal";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
Modal.setAppElement("body");

export default function Home({ uploadOpen, setUploadOpen }) {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [randomMode, setRandomMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [columnWidth, setColumnWidth] = useState(200);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const galleryRef = useRef(null);
  const masonryInstance = useRef(null);

  const updateColumnWidth = () => {
    if (window.innerWidth > 1024) setColumnWidth(250);
    else if (window.innerWidth > 768) setColumnWidth(200);
    else if (window.innerWidth > 480) setColumnWidth(120);
    else setColumnWidth(window.innerWidth - 20);
  };

  useEffect(() => {
    fetch(`${API_URL}/files`)
      .then((res) => res.json())
      .then(async (data) => {
        const filesWithDimensions = await Promise.all(
          data.files.map(async (file) => {
            if (!file || !file.path) return file;
            if (file.filename.endsWith(".mp4") || file.filename.endsWith(".webm")) return file;
            return new Promise((resolve) => {
              const img = new Image();
              img.src = `${API_URL}${file.path}`;
              img.onload = () => resolve({ ...file, width: img.naturalWidth, height: img.naturalHeight });
              img.onerror = () => resolve({ ...file });
            });
          })
        );
        const sorted = filesWithDimensions.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setFiles(sorted);
        setFilteredFiles(sorted);
      })
      .catch((err) => console.error("Erreur :", err));
  }, []);
  useEffect(() => {
    if (modalIsOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.dataset.scrollY = scrollY;
    } else {
      const scrollY = document.body.dataset.scrollY;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0"));
      delete document.body.dataset.scrollY;
    }
  }, [modalIsOpen]);
  
  useEffect(() => {
    if (!galleryRef.current) return;
    import("masonry-layout").then(({ default: Masonry }) => {
      if (masonryInstance.current) masonryInstance.current.destroy();
      masonryInstance.current = new Masonry(galleryRef.current, {
        itemSelector: ".file-card",
        columnWidth: 220,
        gutter: 15,
        fitWidth: true,
        horizontalOrder: true,
        percentPosition: false,
      });
      masonryInstance.current.layout();
    });
    return () => {
      if (masonryInstance.current) masonryInstance.current.destroy();
    };
  }, [filteredFiles, columnWidth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      masonryInstance.current?.layout();
    }, 300);
    return () => clearTimeout(timer);
  }, [filteredFiles]);

  useEffect(() => {
    const handleResize = () => {
      updateColumnWidth();
      masonryInstance.current?.layout();
      setTimeout(() => masonryInstance.current?.layout(), 300);
    };
    window.addEventListener("resize", handleResize);
    updateColumnWidth();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(filterType, query, randomMode);
  };

  const handleFilter = (type) => {
    setFilterType(type);
    setFilteredFiles([]);
    setTimeout(() => {
      applyFilters(type, searchQuery, randomMode);
    }, 0);
  };

  const resetFilter = () => {
    setSearchQuery("");
    setFilterType("");
    setFilteredFiles(files);
  };

  const handleRandom = () => {
    const newState = !randomMode;
    setRandomMode(newState);
    applyFilters(filterType, searchQuery, newState);
  };

  const openModal = (file) => {
    setSelectedFile(file);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedFile(null);
    setModalIsOpen(false);
  };

  const applyFilters = (type, query, isRandom) => {
    let url = `${API_URL}/files`;
    if (query) url = `${API_URL}/search?query=${query}`;
    else if (type) url = `${API_URL}/filter?type=${type}`;

    fetch(url)
      .then((res) => res.json())
      .then(async (data) => {
        const filesWithDimensions = await Promise.all(
          data.files.map(async (file) => {
            if (!file || !file.path) return file;
            if (file.filename.endsWith(".mp4") || file.filename.endsWith(".webm")) return file;
            return new Promise((resolve) => {
              const img = new Image();
              img.src = `${API_URL}${file.path}`;
              img.onload = () => resolve({ ...file, width: img.naturalWidth, height: img.naturalHeight });
              img.onerror = () => resolve({ ...file });
            });
          })
        );
        let finalList = filesWithDimensions.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        if (isRandom) finalList = [...finalList].sort(() => Math.random() - 0.5);
        setFilteredFiles(finalList);
      })
      .catch((err) => console.error("Erreur filtrage combiné :", err));
  };

  return (
    <div className="container">
      <h1>Développement en cours... 🚀</h1>
      <p>Prochaines étapes, création BDD, gestion users, commentaires, likes</p>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="🔍 Rechercher un fichier..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="filter-buttons">
        <button onClick={() => handleFilter("")} className={!filterType ? "active" : ""}>🔄 Tout</button>
        <button onClick={() => handleFilter("image")} className={filterType === "image" ? "active" : ""}>📷 Images</button>
        <button onClick={() => handleFilter("video")} className={filterType === "video" ? "active" : ""}>🎥 Vidéos</button>
        <button onClick={handleRandom} className={randomMode ? "active" : ""}>🎲 Aléatoire</button>
      </div>

      <div className="gallery" ref={galleryRef}>
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`file-card ${(file.width / file.height) > 1.5 ? "wide-card" : ""}`}
            onClick={() => openModal(file)}
          >
            {file.filename.endsWith(".mp4") || file.filename.endsWith(".webm") ? (
              <div className="thumbnail video">
                <video
                  src={`${API_URL}${file.path}`}
                  width="100%"
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => e.target.pause()}
                  muted
                  loop
                  style={{ minHeight: "150px" }}
                />
                <span className="icon video">
                  <FontAwesomeIcon icon={faVideo} />
                </span>
              </div>
            ) : (
              <div className="thumbnail image">
                <img src={`${API_URL}${file.path}`} alt="Image" width="100%" />
                <span className="icon image">
                  <FontAwesomeIcon icon={faCamera} />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showScrollButton && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={(newFile) => {
          setFiles((prev) => [newFile, ...prev]);
          setFilteredFiles((prev) => [newFile, ...prev]);
        }}
      />

      {/* ✅ Nouvelle modale refondue : texte à gauche, media à droite */}
      <Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  className="modal-content full"
  overlayClassName="overlay"
>
  <button className="close-button" onClick={closeModal}>✖</button>

  {selectedFile && (
    <div className="modal-grid">
      {/* Partie gauche : texte */}
      <div className="modal-left">
        <div className="modal-description-box expanded">
          <p className="modal-description-text">
            {selectedFile.title || "Pas de description"}
          </p>
        </div>

        <div className="modal-tags">
          {selectedFile.tags?.map(tag => `#${tag}`).join(" ")}
        </div>

        <div className="modal-comments">
          <h3>Commentaires</h3>
          <p style={{ color: "#aaa" }}>💬 Cette section est en cours de développement...</p>
        </div>
      </div>

      {/* Partie droite : media */}
      <div className="modal-right">
        {selectedFile.filename.endsWith(".mp4") || selectedFile.filename.endsWith(".webm") ? (
          <video
            src={`${API_URL}${selectedFile.path}`}
            controls
            autoPlay
            loop
            className="media-full"
          />
        ) : (
          <img
            src={`${API_URL}${selectedFile.path}`}
            alt="Image"
            className="media-full"
          />
        )}
      </div>
    </div>
  )}

  <div className="modal-footer">
    {showConfirm ? (
      <div className="confirm-box">
        <p>Êtes-vous sûr de vouloir supprimer ce fichier ?</p>
        <button className="confirm-btn" onClick={async () => {
          try {
            const response = await fetch(`${API_URL}/delete/${selectedFile.filename}`, {
              method: "DELETE",
            });
            if (response.ok) {
              setFiles(prev => prev.filter(file => file.filename !== selectedFile.filename));
              setFilteredFiles(prev => prev.filter(file => file.filename !== selectedFile.filename));
              closeModal();
            } else {
              console.error("Erreur lors de la suppression !");
            }
          } catch (error) {
            console.error("Erreur lors de la requête :", error);
          } finally {
            setShowConfirm(false);
          }
        }}>
          Oui
        </button>
        <button className="cancel-btn" onClick={() => setShowConfirm(false)}>Non</button>
      </div>
    ) : (
      <button className="delete-btn" onClick={() => setShowConfirm(true)}>🗑 Supprimer</button>
    )}
  </div>
</Modal>
    </div>
  );
}
