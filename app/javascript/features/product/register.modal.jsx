import React, { useState, useEffect } from "react";
import { Form, Modal, Input, Button, Select } from "antd";
import { warehouseFeeURL, warehouseURL } from "../../utils/constants";
import { API } from "../../utils/helper";
import $lang from "../../utils/content/jp.json";

const ProductRegisterModal = ({ isOpen, onClose, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [warehouseFees, setWarehouseFees] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  const getWarehouseFees = () => {
    API.get(warehouseFeeURL).then((res) => {
      let index = 1;
      const priceData = res.data.map((item) => {
        return {
          ...item,
          // code: item.
          key: index++,
        };
      });
      const warehouseFees = priceData.map((item) => {
        return {
          value: item.id,
          label:
            item.packaging +
            " / " +
            $lang.handlingFeeUnitPrice +
            " : " +
            item.handling_fee_rate +
            $lang.yen +
            " / " +
            $lang.storageFeeUnitPrice +
            " : " +
            item.storage_fee_rate +
            $lang.yen +
            " / " +
            "  " +
            (item.fee_category == 1
              ? $lang.fullTimeRequest
              : $lang.firstBilling),
        };
      });
      setWarehouseFees(warehouseFees);
    });
  };

  const getWarehouses = () => {
    API.get(warehouseURL).then((res) => {
      let index = 1;
      const data = res.data.map((item) => {
        return {
          key: index++,
          value: item.id,
          label: item.name + " / " + item.responsible_category.name,
        };
      });

      setWarehouseOptions(data);
    });
  };
  useEffect(() => {
    getWarehouseFees();
    getWarehouses();
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
      title={$lang.registerProduct}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
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
          name="code"
          label={$lang.productCode}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={$lang.productName}
          name={"name"}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="specification"
          label={$lang.productPacking}
          rules={[{ required: true, message: $lang.tableCommon.warning }]}
        >
          <Input />
        </Form.Item>
        {warehouseOptions.length > 0 && (
          <Form.Item
            name="warehouse_id"
            label={$lang.targetWarehouse}
            rules={[
              { required: true, message: $lang.messages.select_warehouse },
            ]}
          >
            <Select options={warehouseOptions} allowClear />
          </Form.Item>
        )}
        {warehouseFees.length > 0 && (
          <Form.Item
            name="warehouse_fee_id"
            label={$lang.packing}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Select options={warehouseFees} allowClear />
          </Form.Item>
        )}
        <div style={{ textAlign: "right" }}>
          <Button
            onClick={handleSave}
            style={{ marginRight: 10 }}
            type="primary"
          >
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

export default ProductRegisterModal;
