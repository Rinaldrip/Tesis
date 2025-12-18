import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    eventTitle: string;
}

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    eventTitle
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#0A1A2F]/20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertTriangle className="text-red-600" size={26} />
                        </div>
                        <h2 className="text-2xl font-semibold text-[#0A1A2F]">
                            Confirm Deletion
                        </h2>
                    </div>

                    <p className="text-gray-700 mb-2">
                        Are you sure you want to delete this event?
                    </p>

                    <p className="text-[#0A1A2F] font-semibold mb-6 border-l-4 border-[#D4AF37] pl-3">
                        "{eventTitle}"
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-[#0A1A2F] text-[#0A1A2F] rounded-md 
                            hover:bg-[#0A1A2F]/10 transition-colors font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-md 
                            hover:bg-red-700 transition-colors font-medium shadow-md"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
