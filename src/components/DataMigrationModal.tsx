import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Check, AlertCircle, Loader } from 'lucide-react';
import { dataMigrationService } from '../lib/dataMigration';

interface DataMigrationModalProps {
  onComplete: () => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    tasksCount: number;
    missionsCount: number;
    galleryCount: number;
    tagsCount: number;
    employeesCount: number;
    peopleNotesCount: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    const checkIfMigrationNeeded = async () => {
      const needsMigration = await dataMigrationService.needsMigration();
      setIsOpen(needsMigration);
    };

    checkIfMigrationNeeded();
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);

    try {
      const result = await dataMigrationService.migrateAllData();
      setMigrationResult(result);

      if (result.success) {
        setTimeout(() => {
          setIsOpen(false);
          onComplete();
        }, 3000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        tasksCount: 0,
        missionsCount: 0,
        galleryCount: 0,
        tagsCount: 0,
        employeesCount: 0,
        peopleNotesCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('data-migration-version', '1');
    setIsOpen(false);
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Data Migration Available</h2>
                <p className="text-gray-600 mt-1">
                  We've upgraded to use a database for better performance and reliability
                </p>
              </div>
            </div>

            {!migrationResult ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">What will be migrated?</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      All your tasks and their tags
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      All your missions and requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      All your gallery items (photos and notes)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      All your custom tags
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      All your employee records
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      All your people notes
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Important Notes</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• This migration is one-time and automatic</li>
                        <li>• Your original data will remain in local storage</li>
                        <li>• The process typically takes less than a minute</li>
                        <li>• You can skip this if you prefer to start fresh</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isMigrating ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Migrating Data...
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5" />
                        Migrate My Data
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={isMigrating}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip
                  </button>
                </div>
              </>
            ) : (
              <div>
                {migrationResult.success ? (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Migration Complete!</h3>
                    <p className="text-gray-600 mb-6">Your data has been successfully migrated to the database.</p>
                    <div className="bg-gray-50 rounded-lg p-6 text-left">
                      <h4 className="font-semibold text-gray-900 mb-3">Migration Summary:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {migrationResult.tasksCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tasks:</span>
                            <span className="font-semibold text-gray-900">{migrationResult.tasksCount}</span>
                          </div>
                        )}
                        {migrationResult.missionsCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Missions:</span>
                            <span className="font-semibold text-gray-900">{migrationResult.missionsCount}</span>
                          </div>
                        )}
                        {migrationResult.galleryCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gallery Items:</span>
                            <span className="font-semibold text-gray-900">{migrationResult.galleryCount}</span>
                          </div>
                        )}
                        {migrationResult.tagsCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tags:</span>
                            <span className="font-semibold text-gray-900">{migrationResult.tagsCount}</span>
                          </div>
                        )}
                        {migrationResult.employeesCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Employees:</span>
                            <span className="font-semibold text-gray-900">{migrationResult.employeesCount}</span>
                          </div>
                        )}
                        {migrationResult.peopleNotesCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">People Notes:</span>
                            <span className="font-semibold text-gray-900">{migrationResult.peopleNotesCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Migration Issues</h3>
                    <p className="text-gray-600 mb-4 text-center">Some items could not be migrated:</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                      <ul className="space-y-2 text-sm text-red-800">
                        {migrationResult.errors.map((error, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="flex-shrink-0">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onComplete();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Continue to App
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
