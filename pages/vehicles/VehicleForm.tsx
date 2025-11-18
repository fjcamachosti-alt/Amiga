
import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus, VehicleVisibility, VehicleDocument } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface VehicleFormProps {
  vehicle: Vehicle | null;
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

// Define document groups for a more intuitive layout
const documentGroups = [
  {
    title: 'Documentación Legal',
    items: [
      { name: 'Permiso de Circulación', category: 'documentosBasicos' as keyof Vehicle },
      { name: 'Ficha Técnica', category: 'documentosBasicos' as keyof Vehicle },
      { name: 'Póliza', category: 'documentosBasicos' as keyof Vehicle },
      { name: 'Recibo de Seguro', category: 'documentosBasicos' as keyof Vehicle },
    ],
  },
  {
    title: 'Mantenimiento',
    items: [{ name: 'ITV Favorable', category: 'documentosBasicos' as keyof Vehicle }],
  },
  {
    title: 'Documentación Específica',
    items: [
      { name: 'Memoria', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Administrador Poder Sume', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Certificado Carrocero', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Contrato de Alquiler', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Anexo Contrato de Alquiler', category: 'documentosEspecificos' as keyof Vehicle },
    ],
  },
  {
    title: 'Documentación Adicional',
    items: [
      { name: 'Varios1', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios2', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios3', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios4', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios5', category: 'documentosAdicionales' as keyof Vehicle },
    ],
  },
];

export const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>(vehicle || {});

  useEffect(() => {
    setFormData(vehicle || {});
    setTimeout(() => window.lucide?.createIcons(), 0);
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (category: keyof Vehicle, name: string, file: File) => {
    const newDoc: VehicleDocument = { name, file: file.name, uploadDate: new Date().toISOString().split('T')[0] };
    const docs = (formData[category] as VehicleDocument[] | undefined) || [];
    const updatedDocs = [...docs.filter(d => d.name !== name), newDoc];
    
    setFormData(prev => ({ 
        ...prev, 
        [category]: updatedDocs 
    }));
  };
  
  const getDocument = (category: keyof Vehicle, name: string): VehicleDocument | undefined => {
    const docs = (formData[category] as VehicleDocument[] | undefined) || [];
    return docs.find(d => d.name === name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for mandatory documents
    const mandatoryDocs = ['Permiso de Circulación', 'Ficha Técnica', 'Póliza', 'Recibo de Seguro'];
    const basicDocs = (formData.documentosBasicos || []).map(d => d.name);
    const missingDocs = mandatoryDocs.filter(doc => !basicDocs.includes(doc));
    
    if (missingDocs.length > 0) {
        alert(`Faltan documentos obligatorios: ${missingDocs.join(', ')}`);
        return;
    }

    onSave(formData as Vehicle);
  };
  
  const renderDocumentUploadRow = (docItem: {name: string, category: keyof Vehicle}) => {
    const doc = getDocument(docItem.category, docItem.name);
    return (
       <div key={docItem.name} className="flex items-center justify-between gap-4 border-b border-gray-700 py-2">
            <label className="text-sm">{docItem.name}</label>
            {doc ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                    <i data-lucide="check-circle" className="h-4 w-4"></i>
                    <span>Cargado</span>
                </div>
            ) : (
              <input 
                  type="file" 
                  onChange={(e) => e.target.files && handleFileChange(docItem.category, docItem.name, e.target.files[0])}
                  className="text-sm text-gray-400 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600"
              />
            )}
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-on-surface mb-4">Datos Básicos del Vehículo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Matrícula" name="matricula" value={formData.matricula || ''} onChange={handleChange} required />
            <Input label="Marca" name="marca" value={formData.marca || ''} onChange={handleChange} required />
            <Input label="Modelo" name="modelo" value={formData.modelo || ''} onChange={handleChange} required />
            <Input label="Año" name="ano" type="number" value={formData.ano || ''} onChange={handleChange} required />
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Disponibilidad</label>
                <select name="estado" value={formData.estado || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                    <option value={VehicleStatus.Disponible}>Disponible</option>
                    <option value={VehicleStatus.NoDisponible}>No Disponible</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Visibilidad</label>
                <select name="visibilidad" value={formData.visibilidad || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                    <option value={VehicleVisibility.Visible}>Visible</option>
                    <option value={VehicleVisibility.NoVisible}>No Visible (Admin/Gestor)</option>
                </select>
            </div>
        </div>
      </div>
      
      <div className="space-y-6 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-on-surface">Gestión Documental</h3>
        {documentGroups.map(group => (
            <div key={group.title}>
                <h4 className="font-medium text-gray-300 mb-2">{group.title}</h4>
                <div className="space-y-2">
                    {group.items.map(renderDocumentUploadRow)}
                </div>
            </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Vehículo</Button>
      </div>
    </form>
  );
};
