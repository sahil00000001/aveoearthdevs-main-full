import Button from "../../components/ui/Button";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import { InlineSVG } from "../../components/ui/Icon";

export default function DesignGuide() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--color-green-subtle)] to-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-green-primary)] mb-6">
              Aveoearth
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-8 max-w-3xl mx-auto">
              The sustainable marketplace connecting conscious buyers with verified eco-friendly suppliers
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" leftIcon={
                <InlineSVG size={20} viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 2Z" />
                </InlineSVG>
              }>
                Start Shopping
              </Button>
              <Button variant="secondary" size="lg">
                Become a Supplier
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="p-6 text-center">
              <div className="w-16 h-16 bg-[var(--color-green-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                <InlineSVG size={32} className="text-[var(--color-green-primary)]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </InlineSVG>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-green-primary)] mb-2">
                ESG Verified
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Every product comes with verified sustainability certificates and ESG proof
              </p>
            </Card>

            <Card variant="elevated" className="p-6 text-center">
              <div className="w-16 h-16 bg-[var(--color-green-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                <InlineSVG size={32} className="text-[var(--color-green-primary)]" viewBox="0 0 24 24">
                  <path d="M9 11H7l4-4 4 4h-2v4h4l-4 4-4-4h2v-4z"/>
                </InlineSVG>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-green-primary)] mb-2">
                AI Concierge
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Aveomind AI helps you find the perfect sustainable products for your needs
              </p>
            </Card>

            <Card variant="elevated" className="p-6 text-center">
              <div className="w-16 h-16 bg-[var(--color-green-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                <InlineSVG size={32} className="text-[var(--color-green-primary)]" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </InlineSVG>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-green-primary)] mb-2">
                Trusted Network
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Join thousands of verified buyers and suppliers in our sustainable ecosystem
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Design System Showcase */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[var(--color-green-primary)] mb-12">
            Design System Components
          </h2>
          
          {/* Button Showcase */}
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-xl font-semibold text-black">Button Variants</h3>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
              <div className="flex gap-4 flex-wrap mt-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              <div className="flex gap-4 flex-wrap mt-4">
                <Button loading>Loading...</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Showcase */}
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-xl font-semibold text-black">Card Variants</h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="default" className="p-4">
                  <h4 className="font-semibold mb-2 text-black">Default Card</h4>
                  <p className="text-sm text-gray-700">Standard card with border</p>
                </Card>
                <Card variant="elevated" className="p-4">
                  <h4 className="font-semibold mb-2 text-black">Elevated Card</h4>
                  <p className="text-sm text-gray-700">Card with shadow</p>
                </Card>
                <Card variant="outlined" className="p-4">
                  <h4 className="font-semibold mb-2 text-black">Outlined Card</h4>
                  <p className="text-sm text-gray-700">Card with accent border</p>
                </Card>
                <Card variant="subtle" className="p-4">
                  <h4 className="font-semibold mb-2 text-black">Subtle Card</h4>
                  <p className="text-sm text-gray-700">Card with subtle background</p>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette Showcase */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-black">Color Palette</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-green-primary)] rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-semibold text-black">Primary</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-green-secondary)] rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-semibold text-black">Secondary</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-green-accent)] rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-semibold text-black">Accent</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-green-light)] rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-semibold text-black">Light</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-green-subtle)] rounded-lg mx-auto mb-2 border"></div>
                  <span className="text-sm font-semibold text-black">Subtle</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-green-primary)] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to build sustainable commerce?</h3>
          <p className="text-[var(--color-green-light)] mb-6">
            Join the marketplace that puts sustainability first
          </p>
          <Button variant="secondary" size="lg">
            Get Started Today
          </Button>
        </div>
      </footer>
    </div>
  );
}
