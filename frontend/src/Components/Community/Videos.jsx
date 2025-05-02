import React, { useEffect, useState } from "react";
import { Empty, Spin, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import PostService from "../../Services/PostService";
// import "./Videos.css";

const Videos = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(false);

      try {
        const videos = await PostService.getVideos();
        setVideos(videos);
      } catch (err) {
        console.warn("Videos endpoint not available, falling back to filtering all posts");

        const allPosts = await PostService.getPosts();
        const videoPosts = allPosts.filter(post => 
          post.mediaType === "video" && post.mediaLink
        );
        setVideos(videoPosts);
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
      message.error("Failed to load videos");
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
          description="Unable to load videos. Please try again later." 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
        <button 
          className="retry-button"
          onClick={loadVideos}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="videos-container">
      <h2 className="videos-title">Videos</h2>

      {videos.length === 0 ? (
        <Empty description="No videos have been shared yet" />
      ) : (
        <div className="videos-grid">
          {videos.map((video, index) => (
            <div key={video.id || index} className="video-item">
              <div className="video-player-container">
                <video
                  src={video.mediaLink}
                  controls
                  className="video-player"
                  poster={video.thumbnailUrl}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Videos;
