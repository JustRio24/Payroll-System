import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Target, 
  Award, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  CheckCircle2
} from "lucide-react";
import generatedLogo from "@assets/generated_images/minimalist_geometric_construction_logo.png";

interface ConfigData {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  vision?: string;
  mission?: string;
  history?: string;
}

export default function AboutCompany() {
  const { data: config, isLoading } = useQuery<ConfigData>({
    queryKey: ['/api/config'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display" data-testid="text-page-title">
          Tentang Perusahaan
        </h2>
        <p className="text-slate-500">Informasi lengkap tentang PT Panca Karya Utama</p>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2">
              <img src={generatedLogo} alt="Panca Karya Utama" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-company-name">
                {config?.companyName || 'PT Panca Karya Utama'}
              </h1>
              <p className="text-white/80">Kontraktor Konstruksi Terpercaya</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="border-white/30 text-white bg-white/10">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Berdiri Sejak 2010
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white bg-white/10">
              <Users className="h-3 w-3 mr-1" />
              10+ Karyawan
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white bg-white/10">
              <Award className="h-3 w-3 mr-1" />
              Berpengalaman
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Visi Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed" data-testid="text-vision">
              {config?.vision || 'Menjadi perusahaan konstruksi terkemuka dan terpercaya di Indonesia yang mengutamakan kualitas, inovasi, dan kepuasan pelanggan.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Misi Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed" data-testid="text-mission">
              {config?.mission || 'Memberikan layanan konstruksi berkualitas tinggi dengan mengutamakan keselamatan kerja, ketepatan waktu, dan efisiensi biaya.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Sejarah Perusahaan
          </CardTitle>
          <CardDescription>Perjalanan kami dari awal hingga sekarang</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 leading-relaxed" data-testid="text-history">
            {config?.history || 'PT Panca Karya Utama didirikan pada tahun 2010 di Palembang. Berawal dari sebuah kontraktor kecil, perusahaan telah berkembang menjadi salah satu kontraktor terkemuka di Sumatera Selatan dengan berbagai proyek besar di bidang konstruksi sipil, gedung, dan infrastruktur.'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Informasi Kontak
          </CardTitle>
          <CardDescription>Hubungi kami untuk informasi lebih lanjut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-slate-100 p-2">
                <MapPin className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Alamat</p>
                <p className="text-sm text-slate-600" data-testid="text-address">
                  {config?.companyAddress || 'Jl. Konstruksi No. 123, Palembang, Sumatera Selatan'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-slate-100 p-2">
                <Phone className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Telepon</p>
                <p className="text-sm text-slate-600" data-testid="text-phone">
                  {config?.companyPhone || '+62 711 123456'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-slate-100 p-2">
                <Mail className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Email</p>
                <p className="text-sm text-slate-600" data-testid="text-email">
                  {config?.companyEmail || 'info@pancakaryautama.co.id'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-slate-100 p-2">
                <Globe className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Website</p>
                <p className="text-sm text-slate-600" data-testid="text-website">
                  {config?.companyWebsite || 'www.pancakaryautama.co.id'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-slate-50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-slate-500">
            <p>PT Panca Karya Utama - Konstruksi Berkualitas, Kepuasan Terjamin</p>
            <Separator className="my-4" />
            <p className="text-xs">
              HRIS & Payroll System v1.0 - Developed for PT Panca Karya Utama
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
