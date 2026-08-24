import { useEffect, useState } from 'react';
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
import type { Task, Category, TaskCreatePayload } from '../types';

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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Normal);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(TaskPriority.Normal);
    setCategoryId(null);
    setDueDate(null);
  };

  const handleCreate = async () => {
    const payload: TaskCreatePayload = {
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      categoryId: categoryId ?? undefined,
    };
    await taskService.createTask(payload);
    setDialogVisible(false);
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
    <Button icon="pi pi-trash" severity="danger" text onClick={() => handleDelete(task)} />
  );

  const dueDateBodyTemplate = (task: Task) =>
    task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-';

  return (
    <div style={{ padding: '2rem' }}>
      <ConfirmDialog />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Görevlerim {user && `(${user.username})`}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button label="Yeni Görev" icon="pi pi-plus" onClick={() => setDialogVisible(true)} />
          <Button label="Çıkış" icon="pi pi-sign-out" severity="secondary" outlined onClick={logout} />
        </div>
      </div>

      <DataTable value={tasks} loading={loading} paginator rows={10} emptyMessage="Henüz görev yok.">
        <Column field="title" header="Başlık" sortable />
        <Column field="categoryName" header="Kategori" body={(t: Task) => t.categoryName ?? '-'} />
        <Column header="Öncelik" body={priorityBodyTemplate} sortable field="priority" />
        <Column header="Durum" body={statusBodyTemplate} />
        <Column header="Bitiş" body={dueDateBodyTemplate} />
        <Column header="" body={actionBodyTemplate} style={{ width: '4rem' }} />
      </DataTable>

      <Dialog header="Yeni Görev" visible={dialogVisible} onHide={() => setDialogVisible(false)} style={{ width: '450px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <Button label="Oluştur" onClick={handleCreate} disabled={!title} />
        </div>
      </Dialog>
    </div>
  );
};

export default Tasks;