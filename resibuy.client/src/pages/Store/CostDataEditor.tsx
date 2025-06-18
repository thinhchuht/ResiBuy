import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { CostData, AdditionalData } from '../../types/storeData';

interface Props {
  data: CostData[];
  onChange: (data: CostData[]) => void;
}

const CostDataEditor: React.FC<Props> = ({ data, onChange }) => {
  const handleChange = (index: number, field: keyof CostData, value: CostData[keyof CostData]) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAdditionalChange = (
    costIndex: number,
    addIndex: number,
    field: keyof AdditionalData,
    value: string
  ) => {
    const updated = [...data];
    const additional = [...updated[costIndex].additionalData];
    additional[addIndex] = { ...additional[addIndex], [field]: value };
    updated[costIndex].additionalData = additional;
    onChange(updated);
  };

  const addCostData = () => {
    onChange([
      ...data,
      {
        id: crypto.randomUUID(),
        key: '',
        value: '',
        price: 0,
        productId: '',
        additionalData: [],
      },
    ]);
  };

  const removeCostData = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addAdditionalData = (costIndex: number) => {
    const updated = [...data];
    updated[costIndex].additionalData.push({
      id: crypto.randomUUID(),
      key: '',
      value: '',
      costDataId: updated[costIndex].id,
    });
    onChange(updated);
  };

  const removeAdditionalData = (costIndex: number, addIndex: number) => {
    const updated = [...data];
    updated[costIndex].additionalData.splice(addIndex, 1);
    onChange(updated);
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Chi tiết giá (Cost Data)
      </Typography>

      {data.map((cost, costIndex) => (
        <Box key={cost.id} border={1} borderRadius={2} p={2} mb={2}>
          <Stack spacing={2} direction="row" alignItems="center" flexWrap="wrap">
            <TextField
              label="Key"
              value={cost.key}
              onChange={(e) => handleChange(costIndex, 'key', e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <TextField
              label="Value"
              value={cost.value}
              onChange={(e) => handleChange(costIndex, 'value', e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <TextField
              type="number"
              label="Giá"
              value={cost.price}
              onChange={(e) => handleChange(costIndex, 'price', +e.target.value)}
              sx={{ width: 120 }}
            />
            <IconButton onClick={() => removeCostData(costIndex)} color="error">
              <Delete />
            </IconButton>
          </Stack>

          <Box mt={2}>
            <Typography variant="subtitle1">Additional Data</Typography>
            <Stack spacing={1}>
              {cost.additionalData.map((add, addIndex) => (
                <Stack
                  key={add.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <TextField
                    label="Key"
                    value={add.key}
                    onChange={(e) =>
                      handleAdditionalChange(costIndex, addIndex, 'key', e.target.value)
                    }
                    sx={{ flex: 1, minWidth: 160 }}
                  />
                  <TextField
                    label="Value"
                    value={add.value}
                    onChange={(e) =>
                      handleAdditionalChange(costIndex, addIndex, 'value', e.target.value)
                    }
                    sx={{ flex: 1, minWidth: 160 }}
                  />
                  <IconButton
                    onClick={() => removeAdditionalData(costIndex, addIndex)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
            <Button
              onClick={() => addAdditionalData(costIndex)}
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            >
              + Thêm thông tin phụ
            </Button>
          </Box>
        </Box>
      ))}

      <Button onClick={addCostData} variant="contained">
        + Thêm CostData
      </Button>
    </Box>
  );
};

export default CostDataEditor;
