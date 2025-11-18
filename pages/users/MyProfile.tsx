
import React, { useEffect, useState } from 'react';
import { User, Shift, Vehicle } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';

interface MyProfileProps {
    user: User;
}

export const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [myShifts, setMyShifts] = useState<Shift[]>([]);
    const [assignedVehicles, setAssignedVehicles] = useState<Vehicle[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [shifts, vehicles] = await Promise.all([
                api.getShifts(user.id),
                api.getVehicles(user.id)
            ]);
            setMyShifts(shifts);
            setAssignedVehicles(vehicles);
            setLoading(false);
            setTimeout(() => window.lucide?.createIcons(), 0);
        };
        fetchData();
    }, [user.id]);

    const handleDownloadPayroll = (month: string) => {
        alert(`Simulación: Descargando nómina de ${month} para ${user.nombre} ${user.primerApellido}`);
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            alert(`Simulación: Archivo ${e.target.files[0].name} subido correctamente a su expediente.`);
        }
    };

    if(loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold">
                     {user.nombre.charAt(0)}{user.primerApellido.charAt(0)}
                 </div>
                 <div>
                     <h2 className="text-3xl font-bold">Mi Perfil</h2>
                     <p className="text-gray-400">{user.puesto} - {user.rol}</p>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <Card title="Datos Personales">
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Nombre Completo:</span>
                            <span>{user.nombre} {user.primerApellido} {user.segundoApellido}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Teléfono:</span>
                            <span>{user.telefono}</span>
                        </div>
                         <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span className="text-gray-400">DNI:</span>
                            <span>{user.dni || 'No registrado'}</span>
                        </div>
                    </div>
                </Card>

                {/* Shifts */}
                <Card title="Mis Turnos">
                    {myShifts.length === 0 ? <p className="text-gray-500">No tienes turnos asignados próximamente.</p> : (
                        <ul className="space-y-2">
                            {myShifts.map(shift => (
                                <li key={shift.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                                    <span>{new Date(shift.start).toLocaleDateString()}</span>
                                    <span className="text-gray-300 text-sm">
                                        {new Date(shift.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                        {new Date(shift.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
                
                {/* Assigned Vehicles (Techs only) */}
                {assignedVehicles.length > 0 && (
                    <Card title="Vehículos Asignados">
                         <ul className="space-y-2">
                            {assignedVehicles.map(v => (
                                <li key={v.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <i data-lucide="ambulance" className="text-primary"></i>
                                        <div>
                                            <p className="font-bold">{v.matricula}</p>
                                            <p className="text-xs text-gray-400">{v.marca} {v.modelo}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">{v.estado}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Payrolls */}
                <Card title="Mis Nóminas (Últimos 12 meses)">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map(month => (
                            <button 
                                key={month} 
                                onClick={() => handleDownloadPayroll(month)}
                                className="flex items-center justify-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                            >
                                <i data-lucide="download" className="h-4 w-4"></i>
                                {month}
                            </button>
                        ))}
                    </div>
                </Card>
                
                 {/* Doc Upload */}
                <Card title="Adjuntar Documentación">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Sube aquí justificantes, títulos o documentos solicitados (PDF/JPG).</p>
                         <div className="flex items-center gap-4">
                            <input 
                                type="file" 
                                onChange={handleFileUpload}
                                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
