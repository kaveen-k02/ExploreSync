import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message, DatePicker } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import EventService from "../../Services/EventService";
import moment from "moment";

const UpdateEventForm = () => {
  const snap = useSnapshot(state);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (snap.selectedEvent) {
      setFormData({
        title: snap.selectedEvent.title,
        description: snap.selectedEvent.description,
        date: moment(snap.selectedEvent.date),
      });
    }
  }, [snap.selectedEvent]);

  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      return message.warning("Please fill all required fields.");
    }

    try {
      setLoading(true);
      const eventData = {
        ...formData,
        date: formData.date.toISOString(),
      };
      await EventService.updateEvent(snap.selectedEvent.id, eventData);
      state.updateEventOpened = false;
      setFormData({ title: "", description: "", date: null });
      message.success("Event updated successfully.");
    } catch (err) {
      console.error("Error updating event", err);
      message.error("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    state.updateEventOpened = false;
  };

  return (
    <Modal
      title="Update Event"
      visible={snap.updateEventOpened}
      onCancel={handleCancel}
      footer={null}
    >
      <Input
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        style={{ marginBottom: 10 }}
      />
      <Input.TextArea
        placeholder="Event Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        style={{ marginBottom: 10 }}
      />
      <DatePicker
        value={formData.date}
        onChange={(date) => setFormData({ ...formData, date })}
        style={{ width: "100%", marginBottom: 10 }}
        format="YYYY-MM-DD"
      />
      <Button
        type="primary"
        loading={loading}
        onClick={handleUpdate}
        block
      >
        Update Event
      </Button>
    </Modal>
  );
};

export default UpdateEventForm;
