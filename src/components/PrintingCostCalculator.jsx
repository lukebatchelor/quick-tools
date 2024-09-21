import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToastProvider, useToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useTheme } from '../ThemeContext';

function PrintingCostCalculatorInner() {
  const [filaments, setFilaments] = useState([]);
  const [newFilament, setNewFilament] = useState({ name: '', type: '', weight: '', cost: '', notes: '' });
  const [selectedFilament, setSelectedFilament] = useState('');
  const [printWeight, setPrintWeight] = useState('');
  const [printCost, setPrintCost] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadFilaments();
  }, []);

  useEffect(() => {
    saveFilaments();
  }, [filaments]);

  const loadFilaments = () => {
    try {
      const savedFilaments = localStorage.getItem('filaments');
      if (savedFilaments) {
        const parsedFilaments = JSON.parse(savedFilaments);
        setFilaments(parsedFilaments);
        toast({
          title: "Success",
          description: "Filaments loaded successfully",
        });
      } else {
        toast({
          title: "Info",
          description: "No saved filaments found",
        });
      }
    } catch (error) {
      console.error('Error loading filaments:', error);
      toast({
        title: "Error",
        description: "Failed to load filaments",
        variant: "destructive",
      });
    }
  };

  const saveFilaments = () => {
    try {
      localStorage.setItem('filaments', JSON.stringify(filaments));
    } catch (error) {
      console.error('Error saving filaments:', error);
      toast({
        title: "Error",
        description: "Failed to save filaments",
        variant: "destructive",
      });
    }
  };

  const addOrUpdateFilament = () => {
    if (newFilament.name && newFilament.type && newFilament.weight && newFilament.cost) {
      const filamentWithCostPerGram = {
        ...newFilament,
        costPerGram: (parseFloat(newFilament.cost) / parseFloat(newFilament.weight)).toFixed(4)
      };

      if (editingIndex !== null) {
        // Update existing filament
        const updatedFilaments = [...filaments];
        updatedFilaments[editingIndex] = filamentWithCostPerGram;
        setFilaments(updatedFilaments);
        setEditingIndex(null);
        toast({
          title: "Success",
          description: "Filament updated successfully",
        });
      } else {
        // Add new filament
        setFilaments(prevFilaments => [...prevFilaments, filamentWithCostPerGram]);
        toast({
          title: "Success",
          description: "New filament added",
        });
      }

      setNewFilament({ name: '', type: '', weight: '', cost: '', notes: '' });
      setIsDialogOpen(false);
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setNewFilament(filaments[index]);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingIndex(null);
    setNewFilament({ name: '', type: '', weight: '', cost: '', notes: '' });
    setIsDialogOpen(true);
  };

  const deleteFilament = (index) => {
    const updatedFilaments = filaments.filter((_, i) => i !== index);
    setFilaments(updatedFilaments);
    toast({
      title: "Success",
      description: "Filament deleted successfully",
    });
  };

  const calculateCost = () => {
    const filament = filaments.find(f => f.name === selectedFilament);
    if (filament && printWeight) {
      const cost = filament.costPerGram * printWeight;
      setPrintCost(cost.toFixed(2));
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">{editingIndex !== null ? 'Edit Filament' : 'Add New Filament'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="text"
              value={newFilament.name}
              onChange={(e) => setNewFilament({...newFilament, name: e.target.value})}
              placeholder="Filament Name"
              className="bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <Input
              type="text"
              value={newFilament.type}
              onChange={(e) => setNewFilament({...newFilament, type: e.target.value})}
              placeholder="Filament Type"
              className="bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <Input
              type="number"
              value={newFilament.weight}
              onChange={(e) => setNewFilament({...newFilament, weight: e.target.value})}
              placeholder="Weight (g)"
              className="bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <Input
              type="number"
              value={newFilament.cost}
              onChange={(e) => setNewFilament({...newFilament, cost: e.target.value})}
              placeholder="Cost ($)"
              className="bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <Input
              type="text"
              value={newFilament.notes}
              onChange={(e) => setNewFilament({...newFilament, notes: e.target.value})}
              placeholder="Notes"
              className="bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          <Button onClick={addOrUpdateFilament} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            {editingIndex !== null ? 'Update Filament' : 'Add Filament'}
          </Button>
        </DialogContent>
      </Dialog>

      {filaments.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="py-4">
            <p className="text-center text-black dark:text-white">Add your first filament to start calculating print costs.</p>
            <Button onClick={openAddDialog} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Filament
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Calculate Print Cost</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={selectedFilament} onValueChange={setSelectedFilament}>
                <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                  <SelectValue placeholder="Select Filament" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {filaments.map((filament, index) => (
                    <SelectItem key={index} value={filament.name} className="text-black dark:text-white dark:hover:bg-gray-700">
                      {filament.name} ({filament.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={printWeight}
                onChange={(e) => setPrintWeight(e.target.value)}
                placeholder="Print Weight (g)"
                className="bg-white dark:bg-gray-700 text-black dark:text-white"
              />
              <Button onClick={calculateCost} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">Calculate Cost</Button>
            </CardContent>
          </Card>

          {printCost !== null && (
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Estimated Print Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-black dark:text-white">${printCost}</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black dark:text-white">Saved Filaments</CardTitle>
              <Button onClick={openAddDialog} size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Filament
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {filaments.map((filament, index) => (
                  <li key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md flex justify-between items-center">
                    <div className="text-black dark:text-white">
                      <p className="font-semibold">{filament.name} ({filament.type})</p>
                      <p>Weight: {filament.weight}g - Cost: ${filament.cost}</p>
                      <p>Cost per gram: ${filament.costPerGram}/g</p>
                      {filament.notes && <p className="text-sm text-gray-600 dark:text-gray-400">Notes: {filament.notes}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => startEditing(index)} size="sm" variant="outline" className="bg-white dark:bg-gray-600 text-black dark:text-white">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => deleteFilament(index)} size="sm" variant="outline" className="bg-white text-red-500 hover:text-red-700 dark:bg-gray-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function PrintingCostCalculator() {
  return (
    <ToastProvider>
      <PrintingCostCalculatorInner />
    </ToastProvider>
  );
}

export default PrintingCostCalculator;