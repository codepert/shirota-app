import React, { useEffect, useState } from "react";
import { Table, Pagination, Flex } from "antd";
import PropTypes from "prop-types";
const LocalPaginationTable = (props) => {
  const [page, setPage] = useState({ pn: 1, ps: 10 });
  const [data, setData] = useState([]);
  const { pn, ps } = page;

  useEffect(() => {
    let s = [];
    for (
      let i = (pn - 1) * ps;
      i <
      (pn * ps < props?.dataSource?.length
        ? pn * ps
        : props.dataSource?.length);
      i++
    ) {
      s.push({ ...props?.dataSource[i], no: i + 1 });
    }
    setData(s);
  }, [props.dataSource, props.flag, pn, ps]);

  useEffect(() => {
    if (props.toFirstPane) setPage({ ...page, pn: 1 });
  }, [props]);

  return (
    <Flex vertical gap={"middle"}>
      <Table
        {...props}
        dataSource={data}
        sticky
        pagination={false}
        className="h-full overflow-auto pr-1"
      />
      <Flex justify="flex-end">
        <Pagination
          pageSizeOptions={[10, 20, 50, 100]}
          current={pn}
          pageSize={ps}
          showSizeChanger
          className="p-1"
          defaultPageSize={100}
          onChange={(pn, ps) => setPage({ pn, ps })}
          total={props.dataSource?.length}
        />
      </Flex>
    </Flex>
  );
};

LocalPaginationTable.propTypes = {
  dataSource: PropTypes.array.isRequired,
};

export default LocalPaginationTable;
