import React, { useState, useEffect } from "react";
import messages from "../utils/content/jp.json";
import UserPermissionTable from "../features/pagePermission/index.table";
import { Button, Card } from "antd";
import { API } from "../utils/helper";
import {
  userAuthURL,
  pageURL,
  setAuthorityPageURL,
  authorityPageURL,
} from "../utils/constants";
import { Tabs } from "antd";

const { TabPane } = Tabs;

const PemissionPage = () => {
  const [userAuthData, setUserAuthData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [authorityPages, setAuthorityPages] = useState([]);
  const [authorityId, setAuthorityId] = useState(1);
  const [isClick, setIsClick] = useState(false);

  const getUserAuthorities = () => {
    API.get(userAuthURL)
      .then((res) => {
        setUserAuthData(
          res.data.map((item, index) => ({ ...item, key: index + 1 }))
        );
      })
      .catch((error) => {
        console.error("Error fetching user auth data:", error);
      });
  };

  const getPageList = () => {
    API.get(pageURL)
      .then((res) => {
        setPageData(
          res.data.map((item, index) => ({
            id: item.id,
            name: item.name,
            path: item.path,
            key: index + 1,
            is_read: false,
            is_edit: false,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching client page data:", error);
      });
  };

  const getAuthData = () => {
    API.get(authorityPageURL)
      .then((res) => {
        setAuthorityPages(res.data);
      })
      .catch((error) => {
        console.error("Error fetching auth data", error);
      });
  };

  useEffect(() => {
    getUserAuthorities();
    getPageList();
    getAuthData();
    setIsClick(false);
  }, [isClick]);

  // useEffect (() => {
  // }, [isClick])

  useEffect(() => {
    updateTable(authorityId);
  }, [authorityPages]);

  const saveAuthData = () => {
    setIsClick(true);
    const sendData = pageData.map((item) => ({
      user_authority_id: authorityId,
      page_id: item.id,
      is_edit: item.is_edit,
      is_read: item.is_read,
    }));

    API.post(setAuthorityPageURL, sendData)
      .then((res) => {
        console.log("Checkbox data sent successfully:", sendData);
      })
      .catch((error) => {
        console.error("Error sending checkbox data:", error);
      });
  };

  const handleTabChange = (key) => {
    setAuthorityId(key);
    updateTable(key);
  };

  const updateTable = (key) => {
    const authdata = authorityPages.filter(
      (data) => data.user_authority_id == key
    );
    let newpagedata = pageData.slice();
    newpagedata.map((pagedata, index) => {
      pagedata.is_edit = false;
      pagedata.is_read = false;
      authdata.map((data) => {
        if (pagedata.id == data.page_id) {
          pagedata.is_edit = data.is_edit;
          pagedata.is_read = data.is_read;
        }
      });
    });
    setPageData(newpagedata);
  };

  const onCheckChange = (updateRow) => {
    console.log(updateRow);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card style={{ margin: 20 }} className="py-2 " bordered={false}>
          <Tabs
            defaultActiveKey="1"
            tabPosition="left"
            onChange={handleTabChange}
          >
            {userAuthData.map((row) => (
              <TabPane tab={row.name} key={row.id}></TabPane>
            ))}
          </Tabs>
        </Card>
        <Card style={{ margin: 20 }} className="py-2" bordered={false}>
          {" "}
          <div>
            <div className="">
              <Button
                onClick={saveAuthData}
                className="btn-bg-black"
                style={{ float: "right" }}
              >
                {messages.buttons.save}
              </Button>
            </div>
            <UserPermissionTable
              data={pageData}
              onCheckChange={onCheckChange}
            />
          </div>
        </Card>
      </div>
      <div style={{ textAlign: "center" }}></div>
    </>
  );
};

export default PemissionPage;
