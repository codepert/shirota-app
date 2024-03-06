import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Card, Typography } from "antd";
const { Title } = Typography;
import { Link } from "react-router-dom";
import { openNotificationWithIcon } from "../../../../components/common/notification";
// import { useAuth } from "../../hooks/useAuth";
import { useAuth } from "../../../../hooks/useAuth";
import $lang from "../../../../utils/content/jp.json";

const SignUpFrom = () => {
  const {
    state: { signupErrors },
    signupAction,
  } = useAuth();

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const navigate = useNavigate();

  const onFinishFailed = (errorInfo) => {};

  const onFormSubmit = async ({ name, email, login_id, password }) => {
    const res = await signupAction({
      user: { name, email, login_id, password },
    });

    if (res.status == "success") {
      openNotificationWithIcon(
        "success",
        $lang.popConrimType.success,
        "success registeration"
      );
    } else {
      openNotificationWithIcon("error", $lang.popConrimType.error, res.error);
    }
  };

  return (
    <div className="mx-auto px-6 sm:px-8 md:px-28 lg:px-20 xl:px-0 max-w-screen-sm">
      <div className="flex flex-col justify-center h-full min-h-screen gap-6 xs:gap-7 xs:mt-0">
        <Title
          level={4}
          className="text-center"
          style={{ marginTop: 10, marginBottom: 20 }}
        >
          {$lang.SiteInfo.title}
        </Title>{" "}
        <Card className="py-4">
          <Title
            level={4}
            className="text-center"
            style={{ marginTop: 10, marginBottom: 50 }}
          >
            {$lang.pages.signup}
          </Title>
          {/* {signupErrors && (
            <AlertComponent type="error" message={signupErrors} />
          )} */}
          <Form
            {...formItemLayout}
            name="basic"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFormSubmit}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label={$lang.signupFields.username}
              name="name"
              rules={[
                { required: true, message: $lang.messages.type_username },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={$lang.signupFields.email}
              name="email"
              rules={[
                {
                  type: "email",
                  message: $lang.messages.invalide_email,
                },
                { required: true, message: $lang.messages.type_email },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={$lang.signupFields.loginId}
              name="login_id"
              rules={[{ required: true, message: $lang.messages.type_loginId }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={$lang.signupFields.password}
              name="password"
              rules={[
                { required: true, message: $lang.messages.type_password },
                {
                  min: 6,
                  message: $lang.signupFields.passwordLength,
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                  message: $lang.signupFields.passwordPattern,
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label={$lang.signupFields.confirm_password}
              name="repassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: $lang.messages.type_repassword },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error($lang.messages.no_matched_password)
                    );
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
              <Button className="btn-bg-black" htmlType="submit">
                {$lang.signupFields.signup}
              </Button>
              <Button style={{ marginLeft: 20 }}>
                <Link to="/login">{$lang.signupFields.to_login}</Link>
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SignUpFrom;
