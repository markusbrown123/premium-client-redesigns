import './styles/components.css'
import './styles/platinum-v2.css'
import './App.css'
import { SITE_TARGET } from './site'
import { PlatinumSite } from './sites/platinum/PlatinumSite'
import { SteveGiraltSite } from './sites/steve-giralt/SteveGiraltSite'
import { DeliverablesSite } from './sites/deliverables/DeliverablesSite'
import { A1SealcoatingSite } from './sites/a1-sealcoating/A1SealcoatingSite'

function App() {
  switch (SITE_TARGET) {
    case 'steve-giralt':
      return <SteveGiraltSite />
    case 'deliverables':
      return <DeliverablesSite />
    case 'a1-sealcoating':
      return <A1SealcoatingSite />
    case 'platinum':
    default:
      return <PlatinumSite />
  }
}

export default App
