import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToastProvider, useToast } from "@/components/ui/toast"
import { Pencil, Trash2 } from 'lucide-react';

function PrintingCostCalculatorInner() {
  const [filaments, setFilaments] = useState([]);
  const [newFilament, setNewFilament] = useState({ name: '', type: '', weight: '', cost: '', notes: '' });
  const [selectedFilament, setSelectedFilament] = useState('');
  const [printWeight, setPrintWeight] = useState('');
  const [printCost, setPrintCost] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFilaments();
  }, []);

  useEffect(() => {
    if (filaments.length > 0) {
      saveFilaments();
    }
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
      toast({
        title: "Success",
        description: "Filaments saved successfully",
      });
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
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setNewFilament(filaments[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewFilament({ name: '', type: '', weight: '', cost: '', notes: '' });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingIndex !== null ? 'Edit Filament' : 'Add New Filament'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            type="text"
            value={newFilament.name}
            onChange={(e) => setNewFilament({...newFilament, name: e.target.value})}
            placeholder="Filament Name"
          />
          <Input
            type="text"
            value={newFilament.type}
            onChange={(e) => setNewFilament({...newFilament, type: e.target.value})}
            placeholder="Filament Type"
          />
          <Input
            type="number"
            value={newFilament.weight}
            onChange={(e) => setNewFilament({...newFilament, weight: e.target.value})}
            placeholder="Weight (g)"
          />
          <Input
            type="number"
            value={newFilament.cost}
            onChange={(e) => setNewFilament({...newFilament, cost: e.target.value})}
            placeholder="Cost ($)"
          />
          <Input
            type="text"
            value={newFilament.notes}
            onChange={(e) => setNewFilament({...newFilament, notes: e.target.value})}
            placeholder="Notes"
          />
          <Button onClick={addOrUpdateFilament} className="w-full">
            {editingIndex !== null ? 'Update Filament' : 'Add Filament'}
          </Button>
          {editingIndex !== null && (
            <Button onClick={cancelEditing} variant="outline" className="w-full mt-2">
              Cancel Editing
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Print Cost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select value={selectedFilament} onValueChange={setSelectedFilament}>
            <SelectTrigger>
              <SelectValue placeholder="Select Filament" />
            </SelectTrigger>
            <SelectContent>
              {filaments.map((filament, index) => (
                <SelectItem key={index} value={filament.name}>
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
          />
          <Button onClick={calculateCost} className="w-full">Calculate Cost</Button>
        </CardContent>
      </Card>

      {printCost !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated Print Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${printCost}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved Filaments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {filaments.map((filament, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">{filament.name} ({filament.type})</p>
                  <p>Weight: {filament.weight}g - Cost: ${filament.cost}</p>
                  <p>Cost per gram: ${filament.costPerGram}/g</p>
                  {filament.notes && <p className="text-sm text-gray-600">Notes: {filament.notes}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => startEditing(index)} size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => deleteFilament(index)} size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
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