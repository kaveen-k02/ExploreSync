import React, { useEffect, useState } from "react";
import { Empty, Spin, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import PostService from "../../Services/PostService";
// import "./Gallery.css";

const Gallery = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(false);

      try {
        const images = await PostService.getImageGallery();
        setImages(images);
      } catch {
        const allPosts = await PostService.getPosts();
        const imagePosts = allPosts.filter(
          (post) => post.mediaType === "image" && post.mediaLink
        );
        setImages(imagePosts);
      }
    } catch (error) {
      console.error("Failed to load images:", error);
      message.error("Failed to load images");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Empty
          description="Unable to load images. Please try again later."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <button className="retry-button" onClick={loadImages}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Image Gallery</h2>

      {images.length === 0 ? (
        <Empty description="No images have been shared yet" />
      ) : (
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div key={image.id || index} className="gallery-item">
              <div className="gallery-image-container">
                <img
                  src={image.mediaLink}
                  alt=""
                  className="gallery-image"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
