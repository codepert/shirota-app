import React from "react";

import { EditOutlined } from "@ant-design/icons";
import CustomButton from "../../components/common/CustomButton";
import LocalPaginationTable from "../../components/table/local.pagination.table";
import $lang from "../../utils/content/jp.json";

const UserTable = ({ data, editRow, isEdit }) => {
  const tableColumns = [
    {
      title: $lang.no,
      dataIndex: "key",
      key: "key",
      render: (text) => <a>{text}</a>,
      width: "5%",
    },
    {
      title: $lang.username,
      dataIndex: "name",
      key: "name",
      width: "15%",
    },
    {
      title: $lang.loginId,
      dataIndex: "login_id",
      key: "login_id",
      width: "15%",
    },
    {
      title: $lang.email,
      dataIndex: "email",
      key: "email",
      width: "15%",
    },
    {
      title: $lang.authority,
      dataIndex: "authority",
      key: "authority",
      width: "15%",
    },
    {
      title: $lang.responsibleCategory,
      dataIndex: "responsible_category",
      key: "responsible_category",
      width: "15%",
    },
    isEdit === 1 ? (
      {
        title: "#",
        key: "action",
        width: "5%",
        render: (_, record) => (
          <div className="p-2 rounded-full cursor-pointer items-center text-center">
            <CustomButton
              onClick={() => {
                editRow(record);
              }}
              title={$lang.change}
              icon={<EditOutlined />}
              size="small"
              className="btn-default btn-hover-black"
              style={{ backgroundColor: "transparent", color: "#000" }}
              visability={true}
            />
          </div>
        ),
      }
    ) : (
      <></>
    ),
  ];
  return <LocalPaginationTable dataSource={data} columns={tableColumns} />;
};

export default UserTable;
