import React, { useState, useEffect } from "react";
import { Form, Card, DatePicker, Input, Button, Select } from "antd";
import { manageInfoURL } from "../utils/constants";
import { API } from "../utils/helper";
import $lang from "../utils/content/jp.json";
import dayjs from "dayjs";
import { openNotificationWithIcon } from "../components/common/notification";

const ManageInfoPage = () => {
  const [form] = Form.useForm();

  const getManageInfo = () => {
    API.get(manageInfoURL)
      .then((res) => {
        form.setFieldsValue({
          ...res.data[0],
          start_date: dayjs(new Date(res.data[0].start_date)),
          end_date: dayjs(new Date(res.data[0].end_date)),
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getManageInfo();
  }, []);

  const onSave = (data) => {
    data.start_date = data.start_date.format("YYYY-MM-DD");
    data.end_date = data.end_date.format("YYYY-MM-DD");
    console.log("register data", data);
    if (typeof data.id == "undefined") {
      createInfo(data);
    } else {
      updateInfo(data);
    }
  };

  const createInfo = (data) => {
    API.post(manageInfoURL, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_register_manage_info
        );
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

  const updateInfo = (data) => {
    API.put(`${manageInfoURL}/${data.id}`, data)
      .then((res) => {
        openNotificationWithIcon(
          "success",
          "",
          $lang.messages.success_update_manage_info
        );
      })
      .catch((err) => {
        openNotificationWithIcon("error", "", err.message);
      });
  };

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
    <div className="items-center">
      <Card style={{ width: "50%", margin: "120px 10% 30px 10%" }}>
        <Form form={form} labelCol={{ span: 10 }} labelAlign="left">
          <Form.Item name="id" style={{ height: 0 }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="company_name"
            label={$lang.companyName}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="post_code"
            label={$lang.postCode}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address1"
            label={$lang.mainAddress}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="address2" label={$lang.subAddress}>
            <Input />
          </Form.Item>
          <Form.Item
            name="representative"
            label={$lang.representative}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tel_number"
            label={$lang.telephoneNumber}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fax_number"
            label={$lang.faxNumber}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="start_date"
            label={$lang.firstDate}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <DatePicker format={"YYYY/MM/DD"} />
          </Form.Item>
          <Form.Item
            name="end_date"
            label={$lang.lastDate}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <DatePicker format={"YYYY/MM/DD"} />
          </Form.Item>
          <Form.Item
            name="processing_year"
            label={$lang.processYear}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input type="number" min={1950} max={2100} />
          </Form.Item>
          <Form.Item
            name="processing_month"
            label={$lang.processMonth}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input type="number" min={1} max={12} />
          </Form.Item>
          <Form.Item
            name="installation_location"
            label={$lang.location}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={$lang.invoiceNumber}
            name="invoice_number"
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="register_number"
            label={$lang.registrationNumber}
            rules={[{ required: true, message: $lang.tableCommon.warning }]}
          >
            <Input />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={handleSave}
              style={{ marginRight: 10 }}
              type="primary"
            >
              {" "}
              {$lang.newResiger}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ManageInfoPage;
