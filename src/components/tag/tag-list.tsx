import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { SortOrder } from '@/types';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { MappedPaginatorInfo, Tag } from '@/types';
import { NoDataFound } from '@/components/icons/no-data-found';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { Routes } from '@/config/routes';
import * as categoriesIcon from '@/components/icons/category';
import { getIcon } from '@/utils/get-icon';

export type IProps = {
  tags: Tag[] | undefined | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
  paginatorInfo: MappedPaginatorInfo | null;
};

const TagList = ({
  tags,
  onPagination,
  onSort,
  onOrder,
  paginatorInfo,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

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

  const handleSelectTag = (id: number) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((tagId) => tagId !== id)
        : [...prevSelected, id]
    );
  };

  const handleMultiDelete = async () => {
    const payload = {
      id: selectedTags,
    };

    try {
      const response = await axios.post(
        'https://fun2sh.deificindia.com/tags/multidelete',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Tags deleted successfully!');
        console.log('API Response:', response.data);
        window.location.reload();
      } else {
        toast.error(`Failed to delete tags: ${response.statusText}`);
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      toast.error('Error deleting tags. Please try again!');
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
              setSelectedTags(tags?.map((tag) => tag.id) || []);
            } else {
              setSelectedTags([]);
            }
          }}
          checked={selectedTags.length === (tags?.length || 0)}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      align: 'center',
      width: 50,
      render: (text: any, record: Tag) => (
        <input
          type="checkbox"
          checked={selectedTags.includes(record.id)}
          onChange={() => handleSelectTag(record.id)}
        />
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'id'
          }
          isActive={sortingObj.column === 'id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('id'),
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
      width: 250,
      onHeaderCell: () => onHeaderClick('name'),
    },
    {
      title: t('table:table-item-slug'),
      dataIndex: 'slug',
      key: 'slug',
      align: 'center',
      width: 250,
      ellipsis: true,
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
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: alignRight,
      width: 250,
      render: (slug: string, record: Tag) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_TAG"
          routes={Routes?.tag}
        />
      ),
    },
  ];

  return (
    <>
      {selectedTags.length > 0 && (
        <div className="mb-6 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Selected Tags Actions</h3>
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
          //@ts-ignore
          data={tags}
          rowKey="id"
          scroll={{ x: 1000 }}
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

export default TagList;