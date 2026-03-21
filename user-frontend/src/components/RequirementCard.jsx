import React from 'react';
import { IndianRupee, Calendar, Building2, ChevronRight, CheckCircle2, Heart, MessageCircle } from 'lucide-react';

const RequirementCard = ({ requirement, onNavigate, onDonate, onChat, isPreview = false }) => {
    const isCompleted = requirement.status === 'completed' || requirement.status === 'fulfilled';

    return (
        <div 
            onClick={() => onNavigate(requirement._id)}
            className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full ${isPreview ? 'max-w-md' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <Building2 size={20} />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${!isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                    {requirement.status}
                </div>
            </div>
            
            <div className="flex-1 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">{requirement.title}</h3>
                <p className="text-sm text-gray-500 font-bold mb-3 flex items-center gap-1.5 line-clamp-1">
                    by {requirement.ngoId?.ngoName}
                </p>
                {!isPreview && <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{requirement.description}</p>}
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Goal</span>
                    <span className="text-lg font-black text-emerald-600 flex items-center gap-0.5">
                        <IndianRupee size={16} /> {requirement.amountNeeded.toLocaleString()}
                    </span>
                </div>
                {requirement.deadline && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deadline</span>
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" /> 
                            {new Date(requirement.deadline).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {!isPreview && (
                <div className="mt-6 flex gap-3 pt-4 border-t border-gray-50">
                    {!isCompleted ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDonate(requirement._id); }}
                            className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Heart size={16} /> Donate
                        </button>
                    ) : (
                        <div className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 border border-gray-100">
                             <CheckCircle2 size={16} className="text-emerald-500" /> Requirement Completed
                        </div>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChat(requirement.ngoId?._id, requirement.ngoId?.ngoName); }}
                        className="px-4 bg-white text-gray-600 border border-gray-200 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={16} /> Chat
                    </button>
                </div>
            )}
        </div>
    );
};

export default RequirementCard;
