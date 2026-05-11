import { Activity, Heart, ShieldAlert } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Skin Burn Detection
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered burn analysis for educational purposes. Helping you understand burn severity and find appropriate care.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#analysis" className="text-muted-foreground hover:text-foreground transition-colors">
                  Burn Analysis
                </a>
              </li>
              <li>
                <a href="#specialists" className="text-muted-foreground hover:text-foreground transition-colors">
                  Find Specialists
                </a>
              </li>
              <li>
                <a href="#report" className="text-muted-foreground hover:text-foreground transition-colors">
                  Download Report
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Important Notice</h3>
            <div className="rounded-xl bg-warning/10 border border-warning/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  This tool is for educational purposes only and should not replace professional medical advice. Always consult a healthcare professional for burn injuries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Skin Burn Detection. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-destructive fill-destructive" /> for healthcare education
          </p>
        </div>
      </div>
    </footer>
  )
}
