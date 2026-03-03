import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torchvision import models, transforms
from PIL import Image
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, roc_auc_score, classification_report

class EyePACSDataset(torch.utils.data.Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.images = []
        self.labels = []
        for cls in os.listdir(root_dir):
            cls_dir = os.path.join(root_dir, cls)
            if os.path.isdir(cls_dir):
                label = 0 if cls == '0' else 1
                for img_name in os.listdir(cls_dir):
                    if img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                        self.images.append(os.path.join(cls_dir, img_name))
                        self.labels.append(label)
    def __len__(self): return len(self.images)
    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert('RGB')
        label = torch.tensor(self.labels[idx], dtype=torch.float32)
        if self.transform: image = self.transform(image)
        return image, label

data_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

dataset = EyePACSDataset('data/eyepacs', transform=data_transforms)
_, temp_idx = train_test_split(np.arange(len(dataset)), test_size=0.30, stratify=dataset.labels, random_state=42)
_, test_idx = train_test_split(temp_idx, test_size=0.50, stratify=[dataset.labels[i] for i in temp_idx], random_state=42)
test_loader = DataLoader(Subset(dataset, test_idx), batch_size=64, shuffle=False)

model = models.resnet50()
model.fc = nn.Sequential(
    nn.Linear(model.fc.in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(256, 1),
    nn.Sigmoid()
)

model.load_state_dict(torch.load('../models/cardio_risk_model.h5'))
model.eval()

all_preds, all_labels, all_probs = [], [], []
with torch.no_grad():
    for imgs, labels in test_loader:
        outputs = model(imgs)
        preds = (outputs > 0.5).float()
        all_preds.extend(preds.numpy())
        all_labels.extend(labels.numpy())
        all_probs.extend(outputs.numpy())

test_acc = accuracy_score(all_labels, all_preds)
print(f"REPORT_TEST_ACCURACY: {test_acc*100:.2f}%")
print(f"REPORT_ROC_AUC: {roc_auc_score(all_labels, all_probs):.4f}")
print("REPORT_CONFUSION_MATRIX:\n", confusion_matrix(all_labels, all_preds))
print("REPORT_CLASSIFICATION_REPORT:\n", classification_report(all_labels, all_preds))
