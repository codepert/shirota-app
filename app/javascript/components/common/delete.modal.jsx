import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import $lang from "../../utils/content/jp.json";
const DeleteModal = ({ isOpen, onDelete, onClose, deletedId }) => {
  return (
    <Modal
      title={$lang.popConfirmType.warning}
      open={isOpen}
      onCancel={onClose}
      className="py-5"
      footer={null}
    >
      <br />
      <p className="items-center" style={{ fontSize: 20 }}>
        {$lang.pages.confirm}
      </p>
      <br />
      <div className="flex flex-row" style={{ marginLeft: 260 }}>
        <div className="items-center">
          <Button
            onClick={() => onDelete(deletedId)}
            className="items-center btn-bg-black"
          >
            <DeleteOutlined />
            {$lang.buttons.delete}
          </Button>
        </div>
        <Button style={{ marginLeft: 10 }} onClick={onClose}>
          {$lang.buttons.cancel}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
