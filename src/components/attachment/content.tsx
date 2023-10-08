import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Image, Avatar, Upload, Select, Space, Input, Card } from 'antd';
import { ActionType } from '@ant-design/pro-table';
import ProList from '@ant-design/pro-list';
import { getAttachmentCategories, getAttachments, uploadAttachment } from '@/services/attachment';
import './index.less';
import { CloseOutlined } from '@ant-design/icons';

export type AttachmentContentProps = {
  onSelect: (row?: any) => void;
  onCancel?: () => void;
};

const AttachmentContent: React.FC<AttachmentContentProps> = (props) => {
  const actionRef = useRef<ActionType>();
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    getAttachmentCategories().then((res) => {
      setCategories(res.data || []);
    });
  }, []);

  const handleUploadImage = (e: any) => {
    let formData = new FormData();
    formData.append('file', e.file);
    formData.append('category_id', categoryId + '');
    uploadAttachment(formData).then((res) => {
      if (res.code !== 0) {
        message.info(res.msg);
      } else {
        message.info(res.msg || '上传成功');
        actionRef.current?.reload();
      }
    });
  };

  const handleChangeCategory = (e: any) => {
    setCategoryId(e);
    actionRef.current?.reload();
  };

  const useDetail = (row: any) => {
    props.onSelect(row);
  };

  const handleSearch = (kw: any) => {
    setKeyword(kw);
    actionRef.current?.reload();
  };

  return (
    <div>
      <div className="material-header">
        <Space size={16}>
          <span>选择文件</span>
          <Select defaultValue={categoryId} style={{ width: 120 }} onChange={handleChangeCategory}>
            <Select.Option value={0}>全部资源</Select.Option>
            {categories.map((item: any) => (
              <Select.Option key={item.id} value={item.id}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
          <Input.Search placeholder="输入文件名关键词搜索" onSearch={handleSearch} />
          <Upload
            name="file"
            showUploadList={false}
            multiple
            //accept="*"
            customRequest={handleUploadImage}
          >
            <Button type="primary">上传新文件</Button>
          </Upload>
        </Space>
        {typeof props.onCancel == 'function' && (
          <a className="close" onClick={() => props.onCancel?.()}>
            <CloseOutlined />
          </a>
        )}
      </div>
      <ProList<any>
        actionRef={actionRef}
        className="material-table"
        rowKey="id"
        request={(params) => {
          params.category_id = categoryId;
          params.q = keyword;
          return getAttachments(params);
        }}
        grid={{ gutter: 16, column: 6 }}
        pagination={{
          defaultPageSize: 18,
        }}
        showActions="hover"
        showExtra="hover"
        search={false}
        rowClassName="image-row"
        metas={{
          content: {
            search: false,
            render: (_: any, row: any) => {
              return (
                <div className="image-item">
                  <div className="inner" title={row.file_name}>
                    {row.thumb ? (
                      <Image
                        className="img"
                        preview={{
                          src: row.logo,
                        }}
                        src={row.thumb}
                        alt={row.file_name}
                      />
                    ) : (
                      <a href={row.logo} target={'_blank'}>
                        <Avatar className="default-img" size={100}>
                          {row.file_location.substring(row.file_location.lastIndexOf('.'))}
                        </Avatar>
                      </a>
                    )}
                    <div className="info name">{row.file_name}</div>
                    <div
                      className="info link"
                      onClick={() => {
                        useDetail(row);
                      }}
                    >
                      点击使用
                    </div>
                  </div>
                </div>
              );
            },
          },
        }}
      />
    </div>
  );
};

export default AttachmentContent;
