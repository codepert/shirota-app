import React, { useEffect, useState } from "react";
import { Form, Modal, Input, Button, Select } from "antd";
import { responsibleCategoryURL } from "../../utils/constants";
import { API } from "../../utils/helper";

import $lang from "../../utils/content/jp.json";

const WarehouseRegisterModal = ({ isOpen, onClose, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [responsibleCategoryOptions, setResponsibleCategoryOptions] = useState(
    []
  );

  const getResponsibleCategoryOptions = () => {
    API.get(responsibleCategoryURL).then((res) => {
      let index = 1;

      setResponsibleCategoryOptions(
        res.data.map((item) => {
          return {
            key: index++,
            value: item.id,
            label: item.name,
          };
        })
      );
    });
  };
  useEffect(() => {
    getResponsibleCategoryOptions();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(values, form);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title={$lang.warehouseMaster}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        // layout="vertical"
        labelCol={{ span: 7 }}
        labelAlign="left"
      >
        <Form.Item name="id" style={{ height: 0 }}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          name="name"
          label={$lang.warehouseName}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        {responsibleCategoryOptions.length > 0 && (
          <Form.Item
            name="responsible_category_id"
            label={$lang.responsibleCategory}
            rules={[
              {
                required: true,
                message: $lang.messages.select_responsible_category,
              },
            ]}
          >
            <Select options={responsibleCategoryOptions} allowClear />
          </Form.Item>
        )}
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleSave} style={{ marginRight: 10 }}>
            {" "}
            {$lang.newResiger}
          </Button>
          <Button onClick={onClose} style={{ marginRight: "10px" }}>
            {$lang.cancel}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
export default WarehouseRegisterModal;
