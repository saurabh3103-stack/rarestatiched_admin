import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { siteSettings } from '@/settings/site.settings';
import {
  Category,
  MappedPaginatorInfo,
  SortOrder,
  User,
  UserPaginator,
} from '@/types';
import { useMeQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { NoDataFound } from '@/components/icons/no-data-found';
import Avatar from '@/components/common/avatar';
import Badge from '@/components/ui/badge/badge';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type IProps = {
  customers: User[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const UserList = ({
  customers,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: any | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const onHeaderClick = (column: any | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );

      onOrder(column);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const handleSelectUser = (id: number) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((userId) => userId !== id)
        : [...prevSelected, id]
    );
  };

  const handleMultiDelete = async () => {
    const payload = {
      id: selectedUsers,
    };

    try {
      const response = await axios.post(
        'https://fun2sh.deificindia.com/user/multidelete',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Users deleted successfully!');
        console.log('API Response:', response.data);
        window.location.reload();
      } else {
        toast.error(`Failed to delete users: ${response.statusText}`);
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      toast.error('Error deleting users. Please try again!');
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
              setSelectedUsers(customers?.map((user) => user.id) || []);
            } else {
              setSelectedUsers([]);
            }
          }}
          checked={selectedUsers.length === (customers?.length || 0)}
        />
      ),
      dataIndex: 'select',
      key: 'select',
      align: 'center',
      width: 50,
      render: (text: any, record: User) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(record.id)}
          onChange={() => handleSelectUser(record.id)}
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
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'id'
          }
          isActive={sortingObj.column === 'id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('name'),
      render: (
        name: string,
        { profile, email }: { profile: any; email: string }
      ) => (
        <div className="flex items-center">
          <Avatar name={name} src={profile?.avatar?.thumbnail} />
          <div className="flex flex-col whitespace-nowrap font-medium ms-2">
            {name}
            <span className="text-[13px] font-normal text-gray-500/80">
              {email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      align: alignLeft,
      width: 300,
      render: (permissions: any) => {
        return (
          <div className="flex flex-wrap gap-1.5 whitespace-nowrap">
            {permissions?.map(
              ({ name, index }: { name: string; index: number }) => (
                <span
                  key={index}
                  className="rounded bg-gray-200/50 px-2.5 py-1"
                >
                  {name}
                </span>
              )
            )}
          </div>
        );
      },
    },
    {
      title: t('table:table-item-available_wallet_points'),
      dataIndex: ['wallet', 'available_points'],
      key: 'available_wallet_points',
      align: 'center',
      width: 150,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'is_active'
          }
          isActive={sortingObj.column === 'is_active'}
        />
      ),
      width: 150,
      className: 'cursor-pointer',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      onHeaderCell: () => onHeaderClick('is_active'),
      render: (is_active: boolean) => (
        <Badge
          textKey={is_active ? 'common:text-active' : 'common:text-inactive'}
          color={
            is_active
              ? 'bg-accent/10 !text-accent'
              : 'bg-status-failed/10 text-status-failed'
          }
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 120,
      render: function Render(id: string, { is_active }: any) {
        const { data } = useMeQuery();
        return (
          <>
            {data?.id != id && (
              <ActionButtons
                id={id}
                userStatus={true}
                isUserActive={is_active}
                showAddWalletPoints={true}
                showMakeAdminButton={true}
              />
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      {selectedUsers.length > 0 && (
        <div className="mb-6 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Selected Users Actions</h3>
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
          // @ts-ignore
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
          data={customers}
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

export default UserList;