import { Heart } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Heart className="h-6 w-6 fill-primary-foreground" />
          KindWave
        </Link>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Lan tỏa lòng tốt qua sự kết nối
          </h1>
          <p className="text-primary-foreground/80">
            Nền tảng quyên góp minh bạch tuyệt đối. Mọi đồng tiền đều có dấu vết
            tác động rõ ràng trên Sổ cái.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} KindWave
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
