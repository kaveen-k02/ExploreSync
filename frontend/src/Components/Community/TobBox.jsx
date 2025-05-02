import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import StoryCard from "./StoryCard";
import { PlusOutlined } from "@ant-design/icons";
import StoryService from "../../Services/StoryService";
// import "./TopBox.css";

const TopBox = () => {
  const snap = useSnapshot(state);
  
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const stories = await StoryService.getAllStories();
        state.storyCards = stories;
      } catch (error) {
        console.error("Error fetching  stories:", error);
      }
    };
    
    fetchStories();
  }, []);
  
  // Only render TopBox when activeIndex is 1 (Posts section)
  if (snap.activeIndex !== 1) {
    return null;
  }
  
  return (
    <div className="top-box">
      <h2 className="top-box-header"> Stories</h2>
      <div className="stories-container">
        <div
          onClick={() => {
            state.createStatusModalOpened = true;
          }}
          className="my_story_card"
        >
          <div className="create-story-icon">
            <PlusOutlined />
          </div>
          <div className="create-story-text">Create Story</div>
        </div>
        
        {snap.storyCards &&
          snap.storyCards.map((card) => (
            <StoryCard key={card.id} card={card} />
          ))}
      </div>
    </div>
  );
};

export default TopBox;