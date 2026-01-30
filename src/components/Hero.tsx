import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles } from 'lucide-react';

interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  return (
    <section className="relative w-full bg-gradient-to-br from-rose-50 via-white to-rose-100 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-right space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>تشكيلة جديدة 2025</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              أناقة يمنية
              <span className="block text-rose-600">بأصالة عصرية</span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
              اكتشفي تشكيلتنا الفريدة من الملابس النسائية التي تجمع بين الأصالة اليمنية 
              والتصاميم العصرية. جودة عالية، أناقة لا تضاهى.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                onClick={onShopNow}
                className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-rose-200 transition-all hover:shadow-xl hover:shadow-rose-300"
              >
                تسوقي الآن
                <ArrowDown className="h-5 w-5 mr-2" />
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-rose-200 text-rose-700 hover:bg-rose-50 px-8 py-6 text-lg rounded-full"
              >
                عرض المجموعة
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 justify-center md:justify-start pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-600">500+</p>
                <p className="text-sm text-gray-500">منتج</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-600">10K+</p>
                <p className="text-sm text-gray-500">عميلة</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-600">4.9</p>
                <p className="text-sm text-gray-500">تقييم</p>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50">
              <img 
                src="/images/hero-model.jpg" 
                alt="بنت اليمن - أزياء نسائية"
                className="w-full h-[500px] md:h-[600px] object-cover"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 to-transparent" />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">شحن مجاني</p>
                <p className="text-sm text-gray-500">للطلبات فوق 500 ريال</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
