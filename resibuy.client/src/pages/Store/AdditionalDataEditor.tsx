// components/AdditionalDataEditor.tsx
import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface AdditionalData {
  key: string;
  value: string;
}

interface Props {
  additionalData: AdditionalData[];
  setAdditionalData: (data: AdditionalData[]) => void;
}

const AdditionalDataEditor: React.FC<Props> = ({ additionalData, setAdditionalData }) => {
  const handleAdd = () => {
    setAdditionalData([...additionalData, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    setAdditionalData(additionalData.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof AdditionalData, value: string) => {
    const updated = [...additionalData];
    updated[index][field] = value;
    setAdditionalData(updated);
  };

  return (
    <Box>
      <Typography variant="subtitle1">Thuộc tính bổ sung</Typography>
      {additionalData.map((item, index) => (
        <Box key={index} display="flex" gap={2} alignItems="center" my={1}>
          <TextField
            label="Key"
            value={item.key}
            onChange={e => handleChange(index, 'key', e.target.value)}
          />
          <TextField
            label="Value"
            value={item.value}
            onChange={e => handleChange(index, 'value', e.target.value)}
          />
          <IconButton onClick={() => handleRemove(index)}><Delete /></IconButton>
        </Box>
      ))}
      <Button startIcon={<Add />} onClick={handleAdd}>Thêm thuộc tính</Button>
    </Box>
  );
};

export default AdditionalDataEditor;
