import { useEffect, useMemo, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../context/AuthContext';
import * as taskService from '../services/taskService';
import * as categoryService from '../services/categoryService';
import { TaskPriority, TaskItemStatus } from '../types';
import type { Task, Category } from '../types';

const priorityOptions = [
  { label: 'Düşük', value: TaskPriority.Low },
  { label: 'Normal', value: TaskPriority.Normal },
  { label: 'Yüksek', value: TaskPriority.High },
  { label: 'Acil', value: TaskPriority.Urgent },
  { label: 'Kritik', value: TaskPriority.Critical },
];

const statusOptions = [
  { label: 'Bekliyor', value: TaskItemStatus.Pending },
  { label: 'Devam Ediyor', value: TaskItemStatus.InProgress },
  { label: 'Tamamlandı', value: TaskItemStatus.Completed },
  { label: 'İptal', value: TaskItemStatus.Cancelled },
];

const priorityLabel = (p: TaskPriority) => priorityOptions.find((o) => o.value === p)?.label ?? p;

const statusSeverity = (s: TaskItemStatus): 'info' | 'warning' | 'success' | 'danger' => {
  switch (s) {
    case TaskItemStatus.Pending: return 'info';
    case TaskItemStatus.InProgress: return 'warning';
    case TaskItemStatus.Completed: return 'success';
    case TaskItemStatus.Cancelled: return 'danger';
    default: return 'info';
  }
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Normal);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [searchText, setSearchText] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskItemStatus | null>(null);

  const { logout, user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskData, categoryData] = await Promise.all([
        taskService.getTasks(),
        categoryService.getCategories(),
      ]);
      setTasks(taskData);
      setCategories(categoryData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = searchText.trim() === '' ||
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description ?? '').toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = filterCategoryId === null || task.categoryId === filterCategoryId;
      const matchesPriority = filterPriority === null || task.priority === filterPriority;
      const matchesStatus = filterStatus === null || task.status === filterStatus;
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [tasks, searchText, filterCategoryId, filterPriority, filterStatus]);

  const clearFilters = () => {
    setSearchText('');
    setFilterCategoryId(null);
    setFilterPriority(null);
    setFilterStatus(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(TaskPriority.Normal);
    setCategoryId(null);
    setDueDate(null);
  };

  const openCreateDialog = () => {
    setEditingTaskId(null);
    resetForm();
    setDialogVisible(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setCategoryId(task.categoryId ?? null);
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    const payload = {
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      categoryId: categoryId ?? undefined,
    };

    if (editingTaskId) {
      await taskService.updateTask(editingTaskId, payload);
    } else {
      await taskService.createTask(payload);
    }

    setDialogVisible(false);
    setEditingTaskId(null);
    resetForm();
    loadData();
  };

  const handleStatusChange = async (task: Task, newStatus: TaskItemStatus) => {
    await taskService.updateTask(task.id, { status: newStatus });
    loadData();
  };

  const handleDelete = (task: Task) => {
    confirmDialog({
      message: `"${task.title}" görevini silmek istediğine emin misin?`,
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await taskService.deleteTask(task.id);
        loadData();
      },
    });
  };

  const statusBodyTemplate = (task: Task) => (
    <Dropdown
      value={task.status}
      options={statusOptions}
      onChange={(e) => handleStatusChange(task, e.value)}
      itemTemplate={(option) => <Tag severity={statusSeverity(option.value)} value={option.label} />}
      valueTemplate={(option) => option && <Tag severity={statusSeverity(option.value)} value={option.label} />}
    />
  );

  const priorityBodyTemplate = (task: Task) => priorityLabel(task.priority);

  const actionBodyTemplate = (task: Task) => (
    <div className="flex gap-1">
      <Button icon="pi pi-pencil" text onClick={() => openEditDialog(task)} />
      <Button icon="pi pi-trash" severity="danger" text onClick={() => handleDelete(task)} />
    </div>
  );

  const dueDateBodyTemplate = (task: Task) =>
    task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-';

  return (
    <div className="p-2 md:p-4">
      <ConfirmDialog />
      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2 mb-4">
        <h2 className="m-0">Görevlerim {user && `(${user.username})`}</h2>
        <div className="flex gap-2">
          <Button label="Yeni Görev" icon="pi pi-plus" onClick={openCreateDialog} />
          <Button label="Çıkış" icon="pi pi-sign-out" severity="secondary" outlined onClick={logout} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex-grow-1" style={{ minWidth: '200px' }}>
          <InputText
            placeholder="Ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />
        </div>
        <Dropdown
          placeholder="Kategori"
          value={filterCategoryId}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          onChange={(e) => setFilterCategoryId(e.value)}
          showClear
          style={{ minWidth: '150px' }}
        />
        <Dropdown
          placeholder="Öncelik"
          value={filterPriority}
          options={priorityOptions}
          onChange={(e) => setFilterPriority(e.value)}
          showClear
          style={{ minWidth: '150px' }}
        />
        <Dropdown
          placeholder="Durum"
          value={filterStatus}
          options={statusOptions}
          onChange={(e) => setFilterStatus(e.value)}
          showClear
          style={{ minWidth: '150px' }}
        />
        {(searchText || filterCategoryId || filterPriority || filterStatus) && (
          <Button label="Filtreleri Temizle" text onClick={clearFilters} />
        )}
      </div>

      <div className="overflow-x-auto">
        <DataTable value={filteredTasks} loading={loading} paginator rows={10} emptyMessage="Görev bulunamadı.">
          <Column field="title" header="Başlık" sortable />
          <Column field="categoryName" header="Kategori" body={(t: Task) => t.categoryName ?? '-'} />
          <Column header="Öncelik" body={priorityBodyTemplate} sortable field="priority" />
          <Column header="Durum" body={statusBodyTemplate} />
          <Column header="Bitiş" body={dueDateBodyTemplate} />
          <Column header="" body={actionBodyTemplate} style={{ width: '6rem' }} />
        </DataTable>
      </div>

      <Dialog
        header={editingTaskId ? 'Görevi Düzenle' : 'Yeni Görev'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '450px' }}
        breakpoints={{ '600px': '95vw' }}
      >
        <div className="flex flex-column gap-3">
          <InputText placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} />
          <InputTextarea placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <Dropdown
            placeholder="Öncelik"
            value={priority}
            options={priorityOptions}
            onChange={(e) => setPriority(e.value)}
          />
          <Dropdown
            placeholder="Kategori (opsiyonel)"
            value={categoryId}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(e) => setCategoryId(e.value)}
            showClear
          />
          <Calendar placeholder="Bitiş tarihi" value={dueDate} onChange={(e) => setDueDate(e.value as Date)} showIcon dateFormat="dd/mm/yy" />
          <Button label={editingTaskId ? 'Güncelle' : 'Oluştur'} onClick={handleSave} disabled={!title} />
        </div>
      </Dialog>
    </div>
  );
};

export default Tasks;