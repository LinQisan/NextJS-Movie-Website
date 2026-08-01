export default function GridWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='grid grid-cols-2 gap-4 place-self-center min-[390px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
      {children}
    </div>
  );
}
