import React, { useState } from "react";
import { Button, Popover } from "antd";
import $lang from "../../../utils/content/jp.json";
const ConfirmPopver = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <Popover
      content={
        <div>
          <p style={{ marginTop: 10, marginBottom: 10 }}>
            {$lang.messages.warning_reset_prepare_inout_stock_list}
          </p>
          <div>
            <Button onClick={onCancel} type="primary">
              {$lang.buttons.yes}
            </Button>
            <Button onClick={onConfirm} style={{ marginLeft: 10 }}>
              {$lang.buttons.no}
            </Button>
          </div>
        </div>
      }
      trigger="click"
      open={isOpen}
    ></Popover>
  );
};
export default ConfirmPopver;
