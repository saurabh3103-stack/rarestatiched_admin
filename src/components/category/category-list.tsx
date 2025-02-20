import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { getIcon } from '@/utils/get-icon';
import * as categoriesIcon from '@/components/icons/category';
import { SortOrder } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Category, MappedPaginatorInfo, Attachment } from '@/types';
import { Config } from '@/config';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { NoDataFound } from '@/components/icons/no-data-found';
import { siteSettings } from '@/settings/site.settings';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type IProps = {
  categories: Category[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const CategoryList = ({
  categories,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();
  const rowExpandable = (record: any) => record.children?.length;
  const { alignLeft, alignRight } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );
      onOrder(column!);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const handleSelectCategory = (id: number) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((categoryId) => categoryId !== id)
        : [...prevSelected, id]
    );
  };

  const handleMultiDelete = async () => {
    const payload = {
      ids: selectedCategories,
    };

    try {
      const response = await axios.post(
        'https://fun2sh.deificindia.com/categories/multidelete',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            
      'Cookie': `XSRF-TOKEN=eyJpdiI6ImE1VDV4OVlHTnA1VUpNR0RQZk9IUWc9PSIsInZhbHVlIjoiOU9UaU44eXpnK2JtVHR0VFdoam5jQlJET0kzanhIYzQydUMxMFpXcjAvNjRnUVJOY0Q2UGg0aDA2c0hhQXAra0xjS3lFV1Z3ejg0aFVIWFlqL0lLSHB6dGx4NitKRjVGOHhLc292a2VkK0xzYnNLamQzSzVnYmFJSGdBYTZaQmIiLCJtYWMiOiIwNDE4MWQxN2FkYWQ3ZDBmYWY3YTdjNTE1NWFiODAzNmU2ZDYxYzliZDlhMjc1MWYxMDAxMGY1ZmEzYjA4Y2JlIiwidGFnIjoiIn0%3D; chawkbazar_session=eyJpdiI6IjdMYmxHdVpwNHgrUER6QmkwRHlQTFE9PSIsInZhbHVlIjoiYWRzWStndG1QeWU5cEZLWlVBTkxoV3N0T3pmY3JTd01Fc0R0UkUvcG9LT1BMUmpJSWZXdFBTdjdZcTVUUzRxekxkSERJdXl2cy9HdHZDWkNKTkNiRzdScG5pZ3hMYkdkbUFzNXNUZWRTeVpvaTRTQ0lTemUvMVRDVEJrTnlyNXYiLCJtYWMiOiI1ZDNhNmY1ZTRmMmJlNTlhYjZhMDhhNzAxNzBhNjMyYTRhOWI2YzQzOWZiMDQyZjFkNTRiMTM3ZDU0NjgwODVlIiwidGFnIjoiIn0%3D`,
            
          },
        }
      );

      if (response.status === 200) {
        toast.success('Categories deleted successfully!');
        console.log('API Response:', response.data);
        window.location.reload();
      } else {
        toast.error(`Failed to delete categories: ${response.statusText}`);
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      toast.error('Error deleting categories. Please try again!');
      console.error('Error during API call:', error);
    }
  };

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCategories(categories?.map((category) => category.id) || []);
            } else {
              setSelectedCategories([]);
            }
          }}
          checked={selectedCategories.length === (categories?.length || 0)}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      align: 'center',
      width: 50,
      render: (text: any, record: Category) => (
        <input
          type="checkbox"
          checked={selectedCategories.includes(record.id)}
          onChange={() => handleSelectCategory(record.id)}
        />
      ),
    },
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 120,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'name'
          }
          isActive={sortingObj.column === 'name'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 90,
      onHeaderCell: () => onHeaderClick('name'),
    },
    {
      title: t('table:table-item-details'),
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      align: alignLeft,
      width: 200,
    },
    {
      title: t('table:table-item-image'),
      dataIndex: 'image',
      key: 'image',
      align: 'center',
      width: 100,
      render: (image: Attachment[]) => {
        if (!image?.length) return null;

        return (
          <div className="flex flex-row items-center justify-center gap-x-2">
            {image?.map((image: Attachment, index: number) => (
              <Image
                src={image?.original ?? '/'}
                alt={`brand-image-${image.id}`}
                layout="fixed"
                width={40}
                height={40}
                className="overflow-hidden h-10 w-10 rounded-lg bg-gray-300 object-contain"
                key={`brand-image-${index}`}
              />
            ))}
          </div>
        );
      },
    },
    {
      title: t('table:table-item-banner-image'),
      dataIndex: 'banner_image',
      key: 'banner_image',
      align: 'center',
      width: 100,
      render: (banner_image: Attachment[]) => {
        if (!banner_image?.length) return null;
        return (
          <div className="flex flex-row items-center justify-center gap-x-2">
            {banner_image && banner_image.map(
              (image: Attachment, index: number) => (
                <Image
                  src={image?.original ?? '/'}
                  alt={`brand-image-${image.id}`}
                  layout="fixed"
                  width={40}
                  height={140}
                  className="overflow-hidden h-10 w-10 rounded-lg bg-gray-300 object-contain"
                  key={`brand-image-${index}`}
                />
              )
            )}
          </div>
        );
      },
    },
    {
      title: t('table:table-item-icon'),
      dataIndex: 'icon',
      key: 'icon',
      align: 'center',
      width: 120,
      render: (icon: string) => {
        if (!icon) return null;
        return (
          <span className="flex items-center justify-center">
            {getIcon({
              iconList: categoriesIcon,
              iconName: icon,
              className: 'w-5 h-5 max-h-full max-w-full',
            })}
          </span>
        );
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-slug')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'slug'
          }
          isActive={sortingObj.column === 'slug'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'slug',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('slug'),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: alignRight,
      width: 90,
      render: (slug: string, record: Category) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_CATEGORY"
          routes={Routes?.category}
        />
      ),
    },
  ];

  return (
    <>
      {selectedCategories.length > 0 && (
        <div className="mb-6 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Selected Categories Actions</h3>
          <div className="flex items-center space-x-6">
            <button
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 transition-colors duration-200 focus:ring-2 focus:ring-red-400 focus:outline-none"
              onClick={handleMultiDelete}
            >
              Delete All
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={categories}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => ' ',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default CategoryList;