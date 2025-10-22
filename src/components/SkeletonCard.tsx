export default function SkeletonCard(){
  return (
    <div className="card">
      <div className="skel img" />
      <div className="skel line" />
      <div className="skel line" style={{width:"60%"}} />
    </div>
  );
}
