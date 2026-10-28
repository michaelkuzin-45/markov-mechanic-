import { Component, type ReactNode } from 'react'

interface Props {
  onError: () => void
  children: ReactNode
}

/** A model that fails to load, or a 3D chunk that fails to arrive, must leave the stills in place and the page usable. */
export class LiveBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
