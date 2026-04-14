import NotionDatepicker from './NotionDatepicker';

export default function Filters({ dateRange, setDateRange }) {
  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      {/* 
         Removido o antigo estilo de botões estáticos ("Este mês")
         em prol da interface interativa e profunda do Notion Date Picker
      */}
      <NotionDatepicker dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  );
}
