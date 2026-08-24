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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

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

  const openCreateDialog = () => {
    setEditingCategoryId(null);
    resetForm();
    setDialogVisible(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description ?? '');
    setColor((category.color ?? '#3498db').replace('#', ''));
    setDialogVisible(true);
  };

  const handleSave = async () => {
    const payload = {
      name,
      description: description || undefined,
      color: `#${color}`,
    };

    if (editingCategoryId) {
      await categoryService.updateCategory(editingCategoryId, payload);
    } else {
      await categoryService.createCategory(payload);
    }

    setDialogVisible(false);
    setEditingCategoryId(null);
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
    <div className="flex gap-1">
      <Button icon="pi pi-pencil" text onClick={() => openEditDialog(category)} />
      <Button icon="pi pi-trash" severity="danger" text onClick={() => handleDelete(category)} />
    </div>
  );

  return (
    <div className="p-2 md:p-4">
      <ConfirmDialog />
      <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2 mb-4">
        <h2 className="m-0">Kategoriler</h2>
        <div className="flex gap-2">
          <Button label="Yeni Kategori" icon="pi pi-plus" onClick={openCreateDialog} />
          <Link to="/tasks">
            <Button label="Görevlere Dön" severity="secondary" outlined />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable value={categories} loading={loading} emptyMessage="Henüz kategori yok.">
          <Column header="" body={colorBodyTemplate} style={{ width: '3rem' }} />
          <Column field="name" header="İsim" sortable />
          <Column field="description" header="Açıklama" body={(c: Category) => c.description ?? '-'} />
          <Column field="taskCount" header="Görev Sayısı" sortable />
          <Column header="" body={actionBodyTemplate} style={{ width: '6rem' }} />
        </DataTable>
      </div>

      <Dialog
        header={editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '400px' }}
        breakpoints={{ '600px': '95vw' }}
      >
        <div className="flex flex-column gap-3">
          <InputText placeholder="İsim" value={name} onChange={(e) => setName(e.target.value)} />
          <InputTextarea placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="flex align-items-center gap-3">
            <span>Renk:</span>
            <ColorPicker value={color} onChange={(e) => setColor(e.value as string)} />
          </div>
          <Button label={editingCategoryId ? 'Güncelle' : 'Oluştur'} onClick={handleSave} disabled={!name} />
        </div>
      </Dialog>
    </div>
  );
};

export default Categories;