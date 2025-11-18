
import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, VehicleStatus, UserRole } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { VehicleForm } from './VehicleForm';
import { VehicleDetails } from './VehicleDetails';
import { Select } from '../../components/ui/Select';
import { tokenService } from '../../services/tokenService';

export const VehiclesPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
    
    // Filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [modelFilter, setModelFilter] = useState('');

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const data = await api.getVehicles(); 
            setVehicles(data);
            setLoading(false);
            setTimeout(() => window.lucide?.createIcons(), 0);
        }
        init();
    }, []);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const handleNewVehicle = () => {
        setSelectedVehicle(null);
        setIsFormModalOpen(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsFormModalOpen(true);
    };
    
    const handleViewDetails = (vehicle: Vehicle) => {
        setViewingVehicle(vehicle);
        setIsDetailsModalOpen(true);
    };

    const handleSaveVehicle = async (vehicle: Vehicle) => {
        await api.saveVehicle(vehicle);
        const updatedVehicles = await api.getVehicles();
        setVehicles(updatedVehicles);
        setIsFormModalOpen(false);
        setSelectedVehicle(null);
    };
    
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => 
            (debouncedSearchTerm === '' || 
                v.matricula.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                v.marca.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                v.modelo.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            ) &&
            (statusFilter === '' || v.estado === statusFilter) &&
            (brandFilter === '' || v.marca === brandFilter) &&
            (modelFilter === '' || v.modelo === modelFilter)
        );
    }, [vehicles, debouncedSearchTerm, statusFilter, brandFilter, modelFilter]);
    
    const uniqueBrands = useMemo(() => [...new Set(vehicles.map(v => v.marca))], [vehicles]);
    const uniqueModels = useMemo(() => [...new Set(vehicles.map(v => v.modelo))], [vehicles]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Gestión de Vehículos</h2>
                <Button onClick={handleNewVehicle} icon={<i data-lucide="plus-circle"></i>}>
                    Nuevo Vehículo
                </Button>
            </div>
            
            <div className="bg-surface p-4 rounded-lg shadow space-y-4">
                 <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar por Matrícula, Marca, Modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i data-lucide="search" className="text-gray-400"></i>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select label="Filtrar por Estado" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Todos</option>
                        <option value={VehicleStatus.Disponible}>Disponible</option>
                        <option value={VehicleStatus.NoDisponible}>No Disponible</option>
                    </Select>
                    <Select label="Filtrar por Marca" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                        <option value="">Todas</option>
                        {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </Select>
                    <Select label="Filtrar por Modelo" value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
                        <option value="">Todos</option>
                        {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </Select>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-surface rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4">Matrícula</th>
                                <th className="p-4">Marca/Modelo</th>
                                <th className="p-4">Año</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 font-mono">{vehicle.matricula}</td>
                                    <td className="p-4">{vehicle.marca} {vehicle.modelo}</td>
                                    <td className="p-4">{vehicle.ano}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vehicle.estado === 'Disponible' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {vehicle.estado}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleViewDetails(vehicle)} className="text-blue-400 hover:underline">Detalles</button>
                                            <button onClick={() => handleEditVehicle(vehicle)} className="text-primary hover:underline">Editar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
                <VehicleForm 
                    vehicle={selectedVehicle}
                    onSave={handleSaveVehicle}
                    onCancel={() => setIsFormModalOpen(false)}
                />
            </Modal>

            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Detalles del Vehículo: ${viewingVehicle?.matricula || ''}`}>
                {viewingVehicle && <VehicleDetails vehicle={viewingVehicle} />}
            </Modal>
        </div>
    );
};
