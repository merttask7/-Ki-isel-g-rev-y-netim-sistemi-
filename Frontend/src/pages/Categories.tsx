import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ColorPicker } from 'primereact/colorpicker';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Link } from 'react-router-dom';
import * as categoryService from '../services/categoryService';
import type { Category } from '../types';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('3498db');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('3498db');
  };

  const handleCreate = async () => {
    await categoryService.createCategory({
      name,
      description: description || undefined,
      color: `#${color}`,
    });
    setDialogVisible(false);
    resetForm();
    loadData();
  };

  const handleDelete = (category: Category) => {
    confirmDialog({
      message: `"${category.name}" kategorisini silmek istediğine emin misin? Bu kategoriye bağlı görevler kategorisiz kalacak.`,
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await categoryService.deleteCategory(category.id);
        loadData();
      },
    });
  };

  const colorBodyTemplate = (category: Category) => (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        backgroundColor: category.color || '#ccc',
      }}
    />
  );

  const actionBodyTemplate = (category: Category) => (
    <Button icon="pi pi-trash" severity="danger" text onClick={() => handleDelete(category)} />
  );

  return (
    <div style={{ padding: '2rem' }}>
      <ConfirmDialog />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Kategoriler</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button label="Yeni Kategori" icon="pi pi-plus" onClick={() => setDialogVisible(true)} />
          <Link to="/tasks">
            <Button label="Görevlere Dön" severity="secondary" outlined />
          </Link>
        </div>
      </div>

      <DataTable value={categories} loading={loading} emptyMessage="Henüz kategori yok.">
        <Column header="" body={colorBodyTemplate} style={{ width: '3rem' }} />
        <Column field="name" header="İsim" sortable />
        <Column field="description" header="Açıklama" body={(c: Category) => c.description ?? '-'} />
        <Column field="taskCount" header="Görev Sayısı" sortable />
        <Column header="" body={actionBodyTemplate} style={{ width: '4rem' }} />
      </DataTable>

      <Dialog header="Yeni Kategori" visible={dialogVisible} onHide={() => setDialogVisible(false)} style={{ width: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputText placeholder="İsim" value={name} onChange={(e) => setName(e.target.value)} />
          <InputTextarea placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Renk:</span>
            <ColorPicker value={color} onChange={(e) => setColor(e.value as string)} />
          </div>
          <Button label="Oluştur" onClick={handleCreate} disabled={!name} />
        </div>
      </Dialog>
    </div>
  );
};

export default Categories;
