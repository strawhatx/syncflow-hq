import React from 'react';

interface EntityType {
  id: string;
  name: string;
  description: string;
}

interface EntityStepProps {
  selectedEntity: string | null;
  onEntitySelect: (entity: string) => void;
}

const entityTypes: EntityType[] = [
  { id: 'products', name: 'Products', description: 'Your stores products, variants, and inventory' },
  { id: 'collections', name: 'Collections', description: 'Product collections and categories' },
  { id: 'orders', name: 'Orders', description: 'Customer orders' },
  { id: 'order-lineitems', name: 'Order Lineitems', description: 'Customer order line items' },
  { id: 'customers', name: 'Customers', description: 'Customer information' },
  { id: 'discounts', name: 'Discounts', description: 'Product discounts/coupons' },
  { id: 'suppliers', name: 'Suppliers', description: 'Supplier information' },
  { id: 'fulfillment', name: 'Fulfillment', description: 'Order fulfillment details' },
  { id: 'abandoned-carts', name: 'Abandoned Carts', description: 'Abandon cart information' },
  { id: 'payments', name: 'Payments', description: 'Payment processing details' },
  { id: 'custom', name: 'Custom', description: 'Custom entity type' }
];

const EntityStep: React.FC<EntityStepProps> = ({ selectedEntity, onEntitySelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entityTypes.map((entity) => (
        <div 
          key={entity.id}
          className={`bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
            selectedEntity === entity.id
              ? "border-primary ring-1 ring-primary"
              : "border-border hover:border-primary/40"
          }`}
          onClick={() => onEntitySelect(entity.id)}
        >
          <h3 className="font-medium mb-2">{entity.name}</h3>
          <p className="text-sm text-muted-foreground">{entity.description}</p>
        </div>
      ))}
    </div>
  );
};

export default EntityStep; 