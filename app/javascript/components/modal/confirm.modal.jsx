import React from "react";
import { Modal, Button } from "antd";

import $lang from "../../utils/content/jp.json";
const ConfirmModal = ({ isOpen, onConfirm, onClose, message }) => {
  return (
    <Modal
      title={""}
      open={isOpen}
      onCancel={onClose}
      className="py-5"
      footer={null}
    >
      <br />
      <p className="" style={{ fontSize: 16, textAlign: "left" }}>
        {message}
      </p>
      <br />
      <div className="flex flex-row" style={{ marginLeft: 260 }}>
        <div className="items-center">
          <Button
            onClick={onConfirm}
            className="items-center btn-bg-black"
            type="primary"
          >
            {$lang.yes}
          </Button>
        </div>
        <Button style={{ marginLeft: 10 }} onClick={onClose}>
          {$lang.cancel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
