
import React from 'react';
import { Vehicle, VehicleDocument } from '../../types';
import { Card } from '../../components/ui/Card';

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

const docTypes = {
    basicos: ['Permiso de Circulación', 'Ficha Técnica', 'Póliza', 'Recibo de Seguro', 'ITV Favorable'],
    especificos: ['Memoria', 'Administrador Poder Sume', 'Certificado Carrocero', 'Contrato de Alquiler', 'Anexo Contrato de Alquiler'],
    adicionales: ['Varios1', 'Varios2', 'Varios3', 'Varios4', 'Varios5'],
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

const DocumentSection: React.FC<{ title: string; documents: VehicleDocument[]; allDocTypes: string[] }> = ({ title, documents, allDocTypes }) => {
    // Fix: Explicitly type the Map to prevent TypeScript from inferring 'doc' as 'unknown'.
    const uploadedDocs = new Map<string, VehicleDocument>(documents.map(d => [d.name, d]));
    
    const getExpirationStatus = (dateStr?: string) => {
        if (!dateStr) {
            // If uploaded but no date, we assume it's valid or doesn't expire
            return { color: 'text-green-400', icon: 'check-circle-2', text: 'Vigente' }; 
        }
        const date = new Date(dateStr);
        const now = new Date();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (date < now) return { color: 'text-red-400', icon: 'alert-octagon', text: 'Caducado' };
        if (date.getTime() - now.getTime() < thirtyDays) return { color: 'text-yellow-400', icon: 'alert-triangle', text: 'Expira pronto' };
        
        return { color: 'text-green-400', icon: 'check-circle-2', text: 'Vigente' };
    };

    return (
        <Card title={title}>
            <ul className="space-y-2">
                {allDocTypes.map(docName => {
                    const doc = uploadedDocs.get(docName);
                    const status = doc ? getExpirationStatus(doc.expirationDate) : null;

                    return (
                        <li key={docName} className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-800">
                            <div className="flex flex-col">
                                <span>{docName}</span>
                                {doc?.expirationDate && (
                                    <span className="text-xs text-gray-500">Exp: {doc.expirationDate}</span>
                                )}
                            </div>
                            
                            {doc ? (
                                <div className="flex items-center gap-3">
                                     {status && (
                                        <div className={`flex items-center gap-1 ${status.color} text-xs font-semibold`}>
                                            <i data-lucide={status.icon} className="h-3 w-3"></i>
                                            <span>{status.text}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-400 border-l border-gray-600 pl-2">
                                        {/* Fix: Render the file name if 'doc.file' is a File object, as File objects cannot be rendered directly. */}
                                        <span className="text-xs font-mono hidden sm:inline-block truncate max-w-[100px]">
                                            {typeof doc.file === 'string' ? doc.file : doc.file?.name}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <i data-lucide="circle" className="h-4 w-4"></i>
                                    <span>Pendiente</span>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
};


export const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
  React.useEffect(() => {
    window.lucide?.createIcons();
  }, [vehicle]);

  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-2xl font-bold">{vehicle.marca} {vehicle.modelo}</h3>
            <p className="text-lg text-gray-400 font-mono">{vehicle.matricula}</p>
        </div>

        <Card title="Información General">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="Año" value={vehicle.ano} />
                <DetailItem 
                    label="Estado" 
                    value={
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vehicle.estado === 'Disponible' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {vehicle.estado}
                        </span>
                    }
                />
                <DetailItem label="Visibilidad" value={vehicle.visibilidad} />
                <DetailItem label="Próxima ITV" value={vehicle.proximaITV} />
                <DetailItem label="Próxima Revisión" value={`${vehicle.proximaRevision.toLocaleString()} km`} />
                <DetailItem label="Vencimiento Seguro" value={vehicle.vencimientoSeguro} />
            </div>
        </Card>
        
        <DocumentSection title="Documentación Básica" documents={vehicle.documentosBasicos || []} allDocTypes={docTypes.basicos} />
        <DocumentSection title="Documentación Específica" documents={vehicle.documentosEspecificos || []} allDocTypes={docTypes.especificos} />
        <DocumentSection title="Documentación Adicional" documents={vehicle.documentosAdicionales || []} allDocTypes={docTypes.adicionales} />

    </div>
  );
};
